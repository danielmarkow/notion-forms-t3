"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

type NotionDate = {
  type: "date";
  data: {
    start: string;
  };
};

type NotionTitle = {
  type: "title";
  title: { type: "text"; text: { content: string; link: string | null } }[];
};

type NotionMultiSelect = {
  type: "multi_select";
  multi_select: { name: string } | null[];
};

type NotionUrl = {
  type: "url";
  url: string;
};

type NotionPage = Record<
  string,
  NotionDate | NotionTitle | NotionMultiSelect | NotionUrl
>;

export default function NotionForm({ params }: { params: { formId: string } }) {
  const { data, isSuccess, isError } = api.notionData.getFormStructure.useQuery(
    {
      notionPageIdId: params.formId,
    },
  );

  const [formState, setFormState] = useState<NotionPage>();
  const generateNewPage = () => {
    const newPage: NotionPage = {};

    const formKeys = Object.keys(data!.formStructure);
    const formStructure = data!.formStructure;

    for (const k of formKeys) {
      // TODO add other properties
      if (formStructure[k]!.type === "date") {
        newPage[k] = {
          type: formStructure[k]!.type,
          data: { start: "" },
        } as NotionDate;
      } else if (formStructure[k]!.type === "title") {
        newPage[k] = {
          type: formStructure[k]!.type,
          title: [{ type: "text", text: { content: "", link: null } }],
        } as NotionTitle;
      } else if (formStructure[k]!.type === "multi_select") {
        newPage[k] = {
          type: "multi_select",
          multi_select: [],
        } as NotionMultiSelect;
      } else if (formStructure[k]!.type === "url") {
        newPage[k] = {
          type: "url",
          url: "",
        } as NotionUrl;
      }
    }
    return newPage;
  };

  useEffect(() => {
    if (isSuccess) {
      setFormState(generateNewPage());
    }
  }, [data]);

  if (isSuccess)
    return (
      <>
        <p>form id: {params.formId}</p>
        {/* <p>{JSON.stringify(data.formStructure)}</p> */}
        {/* <p>
          {Object.keys(data.formStructure).map((k) => (
            <p>{JSON.stringify(data.formStructure[k])}</p>
          ))}
        </p> */}
        <p>{JSON.stringify(formState)}</p>
        <form>
          <div>
            <label htmlFor=""></label>
          </div>
        </form>
      </>
    );

  if (isError) return <p>An error occurred fetching data</p>;
}
