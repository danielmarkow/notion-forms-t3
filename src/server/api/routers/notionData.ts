import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { Client } from "@notionhq/client";

import type { Database } from "~/app/_types/database";
import { notionPageSchema } from "~/app/_types/newPage";

import { getNotionCredentials } from "~/server/utils/backendUtils";

export const notionDataRouter = createTRPCRouter({
  getFormStructure: protectedProcedure
    .input(z.object({ notionPageIdId: z.string() }))
    .query(async ({ ctx, input }) => {
      const notionCredentials = await getNotionCredentials(
        input.notionPageIdId,
        ctx.db,
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
      const dbTitle = notionDb.title;

      return {
        dbInfo,
        formStructure,
        creatorEmail: ctx.session.user.email,
        dbTitle,
      };
    }),
  addNotionDbPage: protectedProcedure
    .input(z.object({ notionPageIdId: z.string(), newPage: notionPageSchema }))
    .mutation(async ({ ctx, input }) => {
      const notionCredentials = await getNotionCredentials(
        input.notionPageIdId,
        ctx.db,
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
