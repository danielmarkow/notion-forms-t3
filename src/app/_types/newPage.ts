import { z } from "zod";

// types and validation for outgoing data

export const dateRequest = z.object({
  start: z.string(),
  end: z.string().optional().nullable(),
  time_zone: z.string().optional().nullable(), // TODO time zone enum
});

export const notionDateSchema = z.object({
  type: z.literal("date"),
  date: dateRequest.nullable(),
});

export type NotionDate = z.infer<typeof notionDateSchema>;

export const richTextItemRequest = z.object({
  type: z.literal("text").optional(),
  text: z.object({
    content: z.string(),
    link: z
      .object({
        url: z.string(),
      })
      .optional()
      .nullable(),
  }),
});

export type RichTextItemRequest = z.infer<typeof richTextItemRequest>;

export const notionTitleSchema = z.object({
  type: z.literal("title"),
  title: z.array(richTextItemRequest),
});

export type NotionTitle = z.infer<typeof notionTitleSchema>;

export const notionMultiSelectSchema = z.object({
  type: z.literal("multi_select"),
  multi_select: z.array(
    z.object({
      name: z.string(),
      id: z.string().optional(),
      color: z.string().optional(), // TODO color enum
    }),
  ),
});

export type NotionMultiSelect = z.infer<typeof notionMultiSelectSchema>;

export const notionUrlSchema = z.object({
  type: z.literal("url"),
  url: z.string(),
});

export type NotionUrl = z.infer<typeof notionUrlSchema>;

export const notionCheckboxSchema = z.object({
  type: z.literal("checkbox"),
  checkbox: z.boolean(),
});

export type NotionCheckbox = z.infer<typeof notionCheckboxSchema>;

export const notionEmailSchema = z.object({
  type: z.literal("email"),
  email: z.string().email(),
});

export type NotionEmail = z.infer<typeof notionEmailSchema>;

export const notionRichTextSchema = z.object({
  type: z.literal("rich_text"),
  rich_text: z.array(
    z.object({
      type: z.literal("text"),
      text: z.object({
        content: z.string(),
        link: z.string().nullable(),
      }),
      annotations: z
        .object({
          bold: z.boolean(),
          italic: z.boolean(),
          strikethrough: z.boolean(),
          underline: z.boolean(),
          code: z.boolean(),
          color: z.string(),
        })
        .optional(),
      plain_text: z.string(),
      href: z.string().nullable(),
    }),
  ),
});

export type NotionRichText = z.infer<typeof notionRichTextSchema>;

export const notionPageSchema = z.record(
  notionDateSchema
    .or(notionTitleSchema)
    .or(notionMultiSelectSchema)
    .or(notionUrlSchema)
    .or(notionCheckboxSchema)
    .or(notionEmailSchema)
    .or(notionRichTextSchema),
);

export type NotionPage = z.infer<typeof notionPageSchema>;
