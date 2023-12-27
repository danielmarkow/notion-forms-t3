export type Database = {
  object: string;
  id: string;
  cover: null;
  icon: { type: string; emoji: string };
  created_time: string;
  created_by: { object: string; id: string };
  last_edited_by: { object: string; id: string };
  last_edited_time: string;
  title: {
    type: string;
    text: { content: string; link: null | string };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href: null;
  }[];
  description: {
    type: string;
    text: {
      content: string;
      link: null | string;
    };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href: null;
  }[];
  is_inline: boolean;
  properties: Record<string, Date | MultiSelect | Title | URL>; // TODO add more properties
  parent: { type: string; workspace: boolean };
  url: string;
  public_url: string | null;
  archived: boolean;
  request_id?: string;
};

// Property types

export type Date = {
  id: string;
  name: string;
  type: "date";
  date: object;
};

export type MultiSelect = {
  id: string;
  name: string;
  type: "multi_select";
  multi_select: {
    option: MultiSelectOption[];
  };
};

export type MultiSelectOption = {
  id: string;
  name: string;
  color: string;
};

export type Title = {
  id: string;
  name: string;
  type: "title";
  title: object;
};

export type URL = {
  id: string;
  name: string;
  type: "url";
  url: object;
};
