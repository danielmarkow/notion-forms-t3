import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Client } from "@notionhq/client";

import { db } from "~/server/db";
import { notionApiKeys, notionPageIds } from "~/server/db/schema";
import type { Database } from "~/app/_types/database";
import { notionPageSchema } from "~/app/_types/newPage";

function decrypt(
  encrypted: string,
  CRYPTO_PASSWORD: string,
  CRYPTO_IV: string,
) {
  const algorithm = "aes256";
  const decipher = crypto.createDecipheriv(
    algorithm,
    CRYPTO_PASSWORD,
    CRYPTO_IV,
  );
  const decrypted =
    decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
  return decrypted;
}

async function getNotionCredentials(notionPageIdId: string, userId: string) {
  const pageData = await db
    .select({
      notionPageId: notionPageIds.notionPageId,
      notionApiKeyId: notionPageIds.notionApiKeyId,
    })
    .from(notionPageIds)
    .where(
      and(
        eq(notionPageIds.id, notionPageIdId),
        eq(notionPageIds.createdById, userId),
      ),
    );

  if (pageData.length > 0) {
    const notionPageId = decrypt(
      pageData[0]!.notionPageId,
      process.env.CRYPTO_PASSWORD!,
      process.env.CRYPTO_IV!,
    );

    const apiKeyData = await db
      .select({
        notionApiKey: notionApiKeys.notionApiKey,
      })
      .from(notionApiKeys)
      .where(
        and(
          eq(notionApiKeys.id, pageData[0]!.notionApiKeyId),
          eq(notionApiKeys.createdById, userId),
        ),
      );

    if (apiKeyData.length > 0) {
      const notionApiKey = decrypt(
        apiKeyData[0]!.notionApiKey,
        process.env.CRYPTO_PASSWORD!,
        process.env.CRYPTO_IV!,
      );
      return { notionApiKey, notionPageId };
    } else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Error retrieving Notion Credentials",
      });
    }
  } else {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Error retrieving Notion Credentials",
    });
  }
}

export const notionDataRouter = createTRPCRouter({
  getFormStructure: protectedProcedure
    .input(z.object({ notionPageIdId: z.string() }))
    .query(async ({ ctx, input }) => {
      const notionCredentials = await getNotionCredentials(
        input.notionPageIdId,
        ctx.session.user.id,
      );

      // query notion
      const notion = new Client({
        auth: notionCredentials.notionApiKey,
      });
      const notionDb = (await notion.databases.retrieve({
        database_id: notionCredentials.notionPageId,
      })) as Database;

      const dbInfo = notionDb.description;
      const formStructure = notionDb.properties;

      return { dbInfo, formStructure };
    }),
  addNotionDbPage: protectedProcedure
    .input(z.object({ notionPageIdId: z.string(), newPage: notionPageSchema }))
    .mutation(async ({ ctx, input }) => {
      const notionCredentials = await getNotionCredentials(
        input.notionPageIdId,
        ctx.session.user.id,
      );

      const notion = new Client({
        auth: notionCredentials.notionApiKey,
      });

      try {
        await notion.pages.create({
          parent: {
            type: "database_id",
            database_id: notionCredentials.notionPageId,
          },
          // @ts-expect-error Type not assignable
          properties: input.newPage,
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Error saving new Notion page",
        });
      }
    }),
});
