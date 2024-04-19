export interface CliInput {
  input: string;
  date: number;
  id: string;
}

export interface Payload {
  input: string;
  stripAnsiEscape: boolean;
  id: string;
}

export type CommandPaletteAction =
  | "set-title"
  | "expand"
  | "theme"
  | "ansi"
  | "save"
  | "about"
  | "help";

export type ElementObject = {
  name: string;
  [key: string]: any;
};

export interface HighlightWorkerRequest {
  input: string;
  stripAnsiEscape: boolean;
  id: string;
}

export interface HighlightWorkerResponse {
  nodes: (ElementObject | string)[];
  id: string;
}

interface Tag {
  tag: string;
  textValue?: string;
}
export type TagGroup = Tag[];
