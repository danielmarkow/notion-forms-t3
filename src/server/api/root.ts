import { createTRPCRouter } from "~/server/api/trpc";
import { notionConfigRouter } from "./routers/notionConfig";
import { notionDataRouter } from "./routers/notionData";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  notionConfig: notionConfigRouter,
  notionData: notionDataRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
