"use client";

import { useEffect, useState } from "react";
import type { MultiSelectOption } from "~/app/_types/database";
import { api } from "~/trpc/react";
import type {
  NotionDate,
  NotionTitle,
  NotionMultiSelect,
  NotionUrl,
  NotionPage,
  NotionCheckbox,
} from "~/app/_types/newPage";
import { notionPageSchema } from "~/app/_types/newPage";

export default function NotionForm({ params }: { params: { formId: string } }) {
  const { data, isSuccess, isError, isLoading } =
    api.notionData.getFormStructure.useQuery({
      notionPageIdId: params.formId,
    });

  const newPageMut = api.notionData.addNotionDbPage.useMutation();

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
          date: { start: "" },
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
      } else if (formStructure[k]!.type === "checkbox") {
        newPage[k] = {
          type: "checkbox",
          checkbox: false,
        } as NotionCheckbox;
      }
    }
    return newPage;
  };

  useEffect(() => {
    if (isSuccess) {
      setFormState(generateNewPage());
    }
  }, [data]);

  if (isError)
    return (
      <p className="text-sm font-medium text-gray-600">
        An error occurred fetching Notion data
      </p>
    );

  if (isLoading)
    return <p className="text-sm font-medium text-gray-600">Loading...</p>;

  if (isSuccess && formState !== undefined)
    return (
      <>
        {/* <p>{JSON.stringify(data.formStructure)}</p> */}
        {/* <p>{JSON.stringify(data.dbTitle)}</p> */}
        <p>{JSON.stringify(formState)}</p>
        <h1 className="text-sm font-medium">
          {data.dbTitle.length > 0 && data.dbTitle[0]?.plain_text}
        </h1>
        <h2 className="text-sm font-medium text-gray-600">
          {data.dbInfo.length > 0 ? data.dbInfo[0]!.text.content : "Your Form"}
        </h2>
        <div className="h-5" />
        <div className="flex justify-center">
          <form className="w-2/3 text-sm">
            <div className="flex flex-col gap-y-3">
              {Object.keys(formState).map((k) => (
                <div key={k}>
                  {formState[k]?.type === "url" && (
                    <div>
                      <label htmlFor={k} className="block text-sm">
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
                        className="w-full border border-gray-300 p-0.5"
                      />
                    </div>
                  )}
                  {formState[k]?.type === "date" && (
                    <div key={k}>
                      <label htmlFor={k} className="block text-sm">
                        {k}
                      </label>
                      <input
                        type="date"
                        id={k}
                        name={k}
                        value={
                          // @ts-expect-error Unsafe assignment
                          // eslint-disable-next-line
                          formState[k].date.start
                        }
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            [k]: {
                              type: "date",
                              date: { start: e.target.value },
                            },
                          })
                        }
                        className="w-full border border-gray-300 p-0.5"
                      />
                    </div>
                  )}
                  {formState[k]!.type === "multi_select" && (
                    <div key={k}>
                      <label htmlFor={k} className="block text-sm">
                        {k}
                      </label>
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
                        className="w-full border border-gray-300 p-0.5"
                      >
                        {
                          // @ts-expect-error Unsafe assignment
                          // eslint-disable-next-line
                          data.formStructure[k].multi_select!.options!.map(
                            (opt: MultiSelectOption) => (
                              <option key={opt.id}>{opt.name}</option>
                            ),
                          )
                        }
                      </select>
                    </div>
                  )}
                  {formState[k]!.type === "title" && (
                    <div key={k}>
                      <label htmlFor={k} className="block text-sm">
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
                        className="w-full border border-gray-300 p-0.5"
                      />
                    </div>
                  )}
                  {formState[k]!.type === "checkbox" && (
                    <div key={k}>
                      <label htmlFor={k} className="block text-sm">
                        {k}
                      </label>
                      <input
                        type="checkbox"
                        id={k}
                        name={k}
                        checked={
                          // @ts-expect-error Unsafe assignment
                          // eslint-disable-next-line
                          formState[k].checkbox
                        }
                        onChange={() =>
                          setFormState({
                            ...formState,
                            [k]: {
                              type: "checkbox",
                              // @ts-expect-error Unsafe assignment
                              // eslint-disable-next-line
                              checkbox: !formState[k]!.checkbox,
                            },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="h-5" />
            <button
              type="button"
              onClick={() => {
                newPageMut
                  .mutateAsync({
                    notionPageIdId: params.formId,
                    newPage: notionPageSchema.parse(formState),
                  })
                  .then(() => setFormState(generateNewPage()))
                  .catch((err) => console.error(err));
              }}
              className="border border-gray-300 px-2 py-0.5 text-sm hover:bg-gray-200"
            >
              {newPageMut.isLoading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          {data.creatorEmail != "" && (
            <footer className="text-sm text-gray-500">
              created by{" "}
              <a href={`mailto:${data.creatorEmail}`}>{data.creatorEmail}</a>
            </footer>
          )}
        </div>
      </>
    );
}
