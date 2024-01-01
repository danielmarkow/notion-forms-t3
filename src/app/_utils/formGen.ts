import type { Properties } from "../_types/database";
import type {
  NotionPage,
  NotionDate,
  NotionTitle,
  NotionMultiSelect,
  NotionUrl,
  NotionCheckbox,
  NotionEmail,
  NotionRichText,
} from "../_types/newPage";

// generates the data structure to bind the forms to
// is already in a format, that can be send to Notion
// as of now the same for public and private forms

export function formDataStructureGen(
  formKeys: string[],
  formStructure: Properties,
) {
  const newPage: NotionPage = {};

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
    } else if (formStructure[k]!.type === "email") {
      newPage[k] = {
        type: "email",
        email: "",
      } as NotionEmail;
    } else if (formStructure[k]!.type === "rich_text") {
      newPage[k] = {
        type: "rich_text",
        rich_text: [
          {
            type: "text",
            text: {
              content: "",
              link: null,
            },
            plain_text: "",
            href: null,
          },
        ],
      } as NotionRichText;
    }
  }

  return newPage;
}
