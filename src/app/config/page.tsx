"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import AddPageToApiKey from "../_components/add-page-to-api-key-form";
import ApiKeysAndPageIds from "../_components/ApiKeysAndPages";

export default function ConfigNotion() {
  const [showAddPage, setShowAddPage] = useState(false);
  const notionConfigQry =
    api.notionConfig.getNotionApiKeysAndPageIds.useQuery();

  if (notionConfigQry.isSuccess)
    return (
      <>
        {JSON.stringify(notionConfigQry.data)}
        <p>config</p>
        {notionConfigQry.data.map((conf) => (
          <div key={conf.id}>
            <ApiKeysAndPageIds conf={conf} />
          </div>
        ))}
      </>
    );
}
