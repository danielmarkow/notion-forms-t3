"use client";

import { useEffect, useState } from "react";
import { MultiSelectOption } from "~/app/_types/database";
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
  multi_select: { name: string }[] | null;
};

type NotionUrl = {
  type: "url";
  url: string;
};

type NotionPage = Record<
  string,
  NotionUrl | NotionTitle | NotionMultiSelect | NotionDate
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

  if (isSuccess && formState !== undefined)
    return (
      <>
        <p>form id: {params.formId}</p>
        {/* <p>{JSON.stringify(data.formStructure.Tags.multi_select.options)}</p> */}
        {/* <p>
          {Object.keys(data.formStructure).map((k) => (
            <p>{JSON.stringify(data.formStructure[k])}</p>
          ))}
        </p> */}
        {/* <p>{JSON.stringify(formState)}</p> */}
        <p>{JSON.stringify(formState)}</p>
        <form>
          {Object.keys(formState).map((k) => (
            <div key={k}>
              {formState[k]?.type === "url" && (
                <div>
                  <label htmlFor={k} className="block">
                    {k}
                  </label>
                  <input
                    id={k}
                    name={k}
                    value={
                      // @ts-expect-error Unsafe assignment
                      // eslint-disable-next-line
                      formState[k]!.url as string
                    }
                    onChange={(e) => {
                      setFormState({
                        ...formState,
                        [k]: { type: "url", url: e.target.value },
                      });
                    }}
                  />
                </div>
              )}
              {formState[k]?.type === "date" && (
                <div>
                  <label htmlFor={k} className="block">
                    {k}
                  </label>
                  <input
                    type="date"
                    id={k}
                    name={k}
                    value={
                      // @ts-expect-error Unsafe assignment
                      // eslint-disable-next-line
                      formState[k].data.start
                    }
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        [k]: { type: "date", data: { start: e.target.value } },
                      })
                    }
                  />
                </div>
              )}
              {formState[k]!.type === "multi_select" && (
                <div>
                  <select
                    id={k}
                    name={k}
                    onChange={(e) => {
                      setFormState({
                        ...formState,
                        [k]: {
                          type: "multi_select",
                          multi_select: [{ name: e.target.value }],
                        },
                      });
                    }}
                  >
                    {
                      // @ts-expect-error Unsafe assignment
                      // eslint-disable-next-line
                      data.formStructure[k].multi_select!.options!.map(
                        (opt: MultiSelectOption) => (
                          <option>{opt.name}</option>
                        ),
                      )
                    }
                  </select>
                </div>
              )}
              {formState[k]!.type === "title" && (
                <div>
                  <label htmlFor={k} className="block">
                    {k}
                  </label>
                  <input
                    type="text"
                    id={k}
                    name={k}
                    value={
                      // @ts-expect-error Unsafe assignment
                      // eslint-disable-next-line
                      formState[k].title[0].text.content
                    }
                    onChange={(e) => {
                      setFormState({
                        ...formState,
                        [k]: {
                          type: "title",
                          title: [
                            {
                              type: "text",
                              text: { content: e.target.value, link: null },
                            },
                          ],
                        },
                      });
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </form>
      </>
    );

  if (isError) return <p>An error occurred fetching data</p>;
}
