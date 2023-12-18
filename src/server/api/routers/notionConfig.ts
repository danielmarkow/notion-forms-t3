import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { notionApiKeys } from "~/server/db/schema";

export const notionConfigRouter = createTRPCRouter({
  addNotionApiKey: protectedProcedure
    .input(z.object({ notionApiKey: z.string(), notionApiKeyName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const algorithm = "aes256";
      const cipher = crypto.createCipheriv(
        algorithm,
        process.env.CRYPTO_PASSWORD!,
        process.env.CRYPTO_IV!,
      );
      const encrypted =
        cipher.update(input.notionApiKey, "utf8", "hex") + cipher.final("hex");

      await ctx.db.insert(notionApiKeys).values({
        id: nanoid(),
        createdById: ctx.session.user.id,
        notionApiKey: encrypted,
        notionApiKeyName: input.notionApiKeyName,
      });
    }),
});
