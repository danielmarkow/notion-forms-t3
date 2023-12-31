import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { notionApiKeys, notionPageIds } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
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
          public: false,
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
    return await ctx.db.query.notionApiKeys.findMany({
      where: eq(notionApiKeys.createdById, ctx.session.user.id),
      columns: {
        id: true,
        notionApiKeyName: true,
        createdAt: true,
      },
      with: {
        pageIds: {
          columns: {
            id: true,
            notionDbName: true,
            createdAt: true,
            public: true,
          },
        },
      },
    });
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
        public: false,
      });
    }),
  removeNotionApiKey: protectedProcedure
    .input(
      z.object({
        notionApiKeyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .delete(notionApiKeys)
          .where(
            and(
              eq(notionApiKeys.id, input.notionApiKeyId),
              eq(notionApiKeys.createdById, ctx.session.user.id),
            ),
          );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error deleting Notion API key",
          cause: error,
        });
      }
    }),
  removeNotionPageId: protectedProcedure
    .input(z.object({ notionPageIdId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .delete(notionPageIds)
          .where(
            and(
              eq(notionPageIds.id, input.notionPageIdId),
              eq(notionPageIds.createdById, ctx.session.user.id),
            ),
          );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error deleting Notion Page Id",
          cause: error,
        });
      }
    }),
  updatePageFormVisibility: protectedProcedure
    .input(z.object({ public: z.boolean(), notionPageIdId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(notionPageIds)
          .set({ public: input.public })
          .where(
            and(
              eq(notionPageIds.id, input.notionPageIdId),
              eq(notionPageIds.createdById, ctx.session.user.id),
            ),
          );
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating page visibility",
          cause: error,
        });
      }
    }),
});
