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
  properties: {
    [key: string]: {
      id: string;
      type: string;
      name: string;
      [key: string]:
        | string
        | object
        | { options: { id: string; name: string; color: string } };
    };
  };
  parent: { type: string; workspace: boolean };
  url: string;
  public_url: string | null;
  archived: boolean;
  request_id?: string;
};
