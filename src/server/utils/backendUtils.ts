import crypto from "node:crypto";
import { notionApiKeys, notionPageIds } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import { TRPCError } from "@trpc/server";

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

export async function getNotionCredentials(
  notionPageIdId: string,
  // eslint-disable-next-line
  db: PlanetScaleDatabase<any>,
  userId?: string,
) {
  if (userId) {
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
  } else {
    // public mode - no user id in the session
    const pageData = await db
      .select({
        notionPageId: notionPageIds.notionPageId,
        notionApiKeyId: notionPageIds.notionApiKeyId,
      })
      .from(notionPageIds)
      .where(
        and(
          eq(notionPageIds.id, notionPageIdId),
          eq(notionPageIds.public, true),
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
        .where(eq(notionApiKeys.id, pageData[0]!.notionApiKeyId));

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
}
