import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import crypto from "node:crypto";
import { db } from "~/server/db";
import { notionApiKeys, notionPageIds } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Client } from "@notionhq/client";
import type { Database } from "~/app/_types/database";

export function decrypt(
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

export const notionDataRouter = createTRPCRouter({
  getFormStructure: protectedProcedure
    .input(z.object({ notionPageIdId: z.string() }))
    .query(async ({ ctx, input }) => {
      // get actual page id
      const pageData = await db
        .select({
          notionPageId: notionPageIds.notionPageId,
          notionApiKeyId: notionPageIds.notionApiKeyId,
        })
        .from(notionPageIds)
        .where(
          and(
            eq(notionPageIds.id, input.notionPageIdId),
            eq(notionPageIds.createdById, ctx.session.user.id),
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
              eq(notionApiKeys.createdById, ctx.session.user.id),
            ),
          );

        if (apiKeyData.length > 0) {
          const notionApiKey = decrypt(
            apiKeyData[0]!.notionApiKey,
            process.env.CRYPTO_PASSWORD!,
            process.env.CRYPTO_IV!,
          );

          // query notion
          const notion = new Client({
            auth: notionApiKey,
          });
          const notionDb = (await notion.databases.retrieve({
            database_id: notionPageId,
          })) as Database;

          const dbInfo = notionDb.description;
          const formStructure = notionDb.properties;

          return { dbInfo, formStructure };
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
    }),
});
