"use client";

import { api } from "~/trpc/react";

export default function ConfigNotion() {
  const notionConfigQry =
    api.notionConfig.getNotionApiKeysAndPageIds.useQuery();

  if (notionConfigQry.isSuccess)
    return (
      <>
        <p>config</p>
        {JSON.stringify(notionConfigQry.data)}
      </>
    );
}
