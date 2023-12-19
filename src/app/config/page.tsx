"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import AddPageToApiKey from "../_components/add-page-to-api-key-form";

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
            <p>{JSON.stringify(conf)}</p>
            <button type="button" onClick={() => setShowAddPage(!showAddPage)}>
              Add Page
            </button>
            {showAddPage && (
              <div>
                <AddPageToApiKey notionApiKeyId={conf.id} />
              </div>
            )}
          </div>
        ))}
      </>
    );
}
