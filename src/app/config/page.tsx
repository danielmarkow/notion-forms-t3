"use client";

import { api } from "~/trpc/react";
import ApiKeysAndPageIds from "../_components/ApiKeysAndPages";
import Link from "next/link";

export default function ConfigNotion() {
  const notionConfigQry =
    api.notionConfig.getNotionApiKeysAndPageIds.useQuery();

  if (notionConfigQry.isLoading) {
    return <p className="text-sm font-medium text-gray-600">Loading...</p>;
  }

  if (notionConfigQry.isError) {
    return (
      <p className="text-sm font-medium text-gray-600">
        An error occurred fetching config data
      </p>
    );
  }

  if (notionConfigQry.isSuccess)
    return (
      <>
        {notionConfigQry.data.length > 0 && (
          <>
            <div className="h-10" />
            {notionConfigQry.data.map((conf) => (
              <div key={conf.id}>
                <ApiKeysAndPageIds conf={conf} />
              </div>
            ))}
            <div className="h-2" />
            <div className="flex justify-center">
              <Link href="/config/new">
                <button
                  type="button"
                  className="border border-gray-300 px-2 py-0.5 text-sm font-thin text-gray-900 hover:bg-gray-200"
                >
                  Add new Notion API key
                </button>
              </Link>
            </div>
          </>
        )}
        {notionConfigQry.data.length === 0 && (
          <>
            <div className="h-5" />
            <p className="text-sm">No Notion API keys configured yet</p>
            <p className="text-sm">Click to add one</p>
            <div className="h-2" />
            <div className="flex justify-center">
              <Link href="/config/new">
                <button
                  type="button"
                  className="border border-gray-300 px-2 py-0.5 text-sm font-thin text-gray-900 hover:bg-gray-200"
                >
                  Add new Notion API key
                </button>
              </Link>
            </div>
          </>
        )}
      </>
    );
}
