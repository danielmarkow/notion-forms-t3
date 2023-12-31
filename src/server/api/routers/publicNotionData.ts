import { getNotionCredentials } from "~/server/utils/backendUtils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { Client } from "@notionhq/client";
import type { Database } from "~/app/_types/database";
import { notionPageIds, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notionPageSchema } from "~/app/_types/newPage";
import { TRPCError } from "@trpc/server";

export const publicNotionDataRouter = createTRPCRouter({
  getFormStructure: publicProcedure
    .input(z.object({ notionPageIdId: z.string() }))
    .query(async ({ ctx, input }) => {
      const notionCredentials = await getNotionCredentials(
        input.notionPageIdId,
        ctx.db,
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
      const dbTitle = notionDb.title;

      // get creator email
      const creatorId = await ctx.db
        .select({
          createdById: notionPageIds.createdById,
        })
        .from(notionPageIds)
        .where(eq(notionPageIds.id, input.notionPageIdId));

      if (creatorId) {
        const creatorEmail = await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, creatorId[0]!.createdById));

        return {
          dbInfo,
          formStructure,
          creatorEmail: creatorEmail[0]?.email ? creatorEmail[0]?.email : "",
          dbTitle,
        };
      }

      return {
        dbInfo,
        formStructure,
        creatorEmail: "",
        dbTitle,
      };
    }),
  addNotionDbPage: publicProcedure
    .input(z.object({ notionPageIdId: z.string(), newPage: notionPageSchema }))
    .mutation(async ({ ctx, input }) => {
      const notionCredentials = await getNotionCredentials(
        input.notionPageIdId,
        ctx.db,
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
