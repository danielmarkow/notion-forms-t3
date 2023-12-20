"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

type Page = {
  [key: string]: {
    type: string;
    [key: string]:
      | string
      | { start: string }
      | { name: string }[]
      | [{ type: string; text: { content: string; link: null | string } }];
  };
};

export default function NotionForm({ params }: { params: { formId: string } }) {
  const { data, isSuccess, isError } = api.notionData.getFormStructure.useQuery(
    {
      notionPageIdId: params.formId,
    },
  );
  const [formState, setFormState] = useState<Page>();
  const generateNewPage = () => {
    const newPage: Page = {};

    const formKeys = Object.keys(data.formStructure);
    const formStructure = data.formStructure;

    // for (let i = 0; i < formKeys.length; i++) {
    for (const k of formKeys) {
      // TODO add other properties
      if (formStructure[k]["type"] === "date") {
        newPage[formKeys[k]] = {
          type: formStructure[k]["type"],
          [formStructure[k]["type"]]: { start: "" },
        };
      } else if (formStructure[k]["type"] === "title") {
        newPage[k] = {
          type: formStructure[k]["type"],
          [formStructure[k]["type"]]: [
            { type: "text", text: { content: "", link: null } },
          ],
        };
      } else if (formStructure[k]["type"] === "multi_select") {
        newPage[k] = {
          type: formStructure[k]["type"],
          [formStructure[k]["type"]]: [],
        };
      } else if (formStructure[k]["type"] === "url") {
        newPage[k] = {
          type: formStructure[k]["type"],
          [formStructure[k]["type"]]: "",
        };
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
        <p>{JSON.stringify(formState)}</p>
      </>
    );

  if (isError) return <p>An error occurred fetching data</p>;
}
