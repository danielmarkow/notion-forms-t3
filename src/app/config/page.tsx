"use client";

import { api } from "~/trpc/react";
import ApiKeysAndPageIds from "../_components/ApiKeysAndPages";

export default function ConfigNotion() {
  const notionConfigQry =
    api.notionConfig.getNotionApiKeysAndPageIds.useQuery();

  if (notionConfigQry.isSuccess)
    return (
      <>
        <h1 className="text-sm font-medium">Config</h1>
        {notionConfigQry.data.map((conf) => (
          <div key={conf.id}>
            <ApiKeysAndPageIds conf={conf} />
          </div>
        ))}
      </>
    );
}
