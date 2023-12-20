"use client";

import { api } from "~/trpc/react";

export default function NotionForm({ params }: { params: { formId: string } }) {
  const { data, isSuccess, isError } = api.notionData.getFormStructure.useQuery(
    {
      notionPageIdId: params.formId,
    },
  );

  if (isSuccess)
    return (
      <>
        <p>form id: {params.formId}</p>
        <p>{JSON.stringify(data)}</p>
      </>
    );

  if (isError) return <p>An error occurred fetching data</p>;
}
