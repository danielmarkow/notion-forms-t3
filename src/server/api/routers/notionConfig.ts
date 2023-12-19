import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { notionApiKeys, notionPageIds } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function encrypt(rawStr: string, CRYPTO_IV: string, CRYPTO_PASSWORD: string) {
  const algorithm = "aes256";
  const cipher = crypto.createCipheriv(algorithm, CRYPTO_PASSWORD, CRYPTO_IV);
  const encrypted = cipher.update(rawStr, "utf8", "hex") + cipher.final("hex");
  return encrypted;
}

export const notionConfigRouter = createTRPCRouter({
  addNotionCredentials: protectedProcedure
    .input(
      z.object({
        notionApiKey: z.string(),
        notionApiKeyName: z.string(),
        notionPageId: z.string(),
        notionDbName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const notionApiKeyId = nanoid();
      try {
        await ctx.db.insert(notionApiKeys).values({
          id: notionApiKeyId,
          createdById: ctx.session.user.id,
          notionApiKey: encrypt(
            input.notionApiKey,
            process.env.CRYPTO_IV!,
            process.env.CRYPTO_PASSWORD!,
          ),
          notionApiKeyName: input.notionApiKeyName,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error saving Notion API key to the db",
          cause: error,
        });
      }

      try {
        await ctx.db.insert(notionPageIds).values({
          id: nanoid(),
          createdById: ctx.session.user.id,
          notionPageId: encrypt(
            input.notionPageId,
            process.env.CRYPTO_IV!,
            process.env.CRYPTO_PASSWORD!,
          ),
          notionDbName: input.notionDbName,
          notionApiKeyId: notionApiKeyId,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error saving Notion page ID to the db",
          cause: error,
        });
      }
    }),
  // addNotionApiKey: protectedProcedure
  //   .input(z.object({ notionApiKey: z.string(), notionApiKeyName: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.db.insert(notionApiKeys).values({
  //       id: nanoid(),
  //       createdById: ctx.session.user.id,
  //       notionApiKey: encrypt(
  //         input.notionApiKey,
  //         process.env.CRYPTO_IV!,
  //         process.env.CRYPTO_PASSWORD!,
  //       ),
  //       notionApiKeyName: input.notionApiKeyName,
  //     });
  //   }),
  getNotionApiKeysAndPageIds: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: notionApiKeys.id,
        notionApiKeyName: notionApiKeys.notionApiKeyName,
        notionPageIdId: notionPageIds.id,
        notionDbName: notionPageIds.notionDbName,
        createdAt: notionApiKeys.createdAt,
        updatedAt: notionApiKeys.updatedAt,
      })
      .from(notionApiKeys)
      .leftJoin(
        notionPageIds,
        eq(notionApiKeys.id, notionPageIds.notionApiKeyId),
      )
      .where(eq(notionApiKeys.createdById, ctx.session.user.id));
  }),
  addNotionPageId: protectedProcedure
    .input(
      z.object({
        notionPageId: z.string(),
        notionDbName: z.string(),
        notionApiKeyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(notionPageIds).values({
        id: nanoid(),
        createdById: ctx.session.user.id,
        notionPageId: encrypt(
          input.notionPageId,
          process.env.CRYPTO_IV!,
          process.env.CRYPTO_PASSWORD!,
        ),
        notionDbName: input.notionDbName,
        notionApiKeyId: input.notionApiKeyId,
      });
    }),
});
