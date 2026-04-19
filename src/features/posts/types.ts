
export type Tag = {
  label: string;
  value: string;
};

export type PostSection = {
  heading: string;
  body: string;
  /**
   * Optional conviction score 0–100. Typically only set on the "receipt"
   * section (H2), but the data model allows it on any section.
   */
  conviction?: number | null;
};

export type Post = {
  id: string;
  title: string;
  /**
   * Two-section body. Section 1 + Section 2 each have their own heading.
   * Legacy posts may have a single `body` string; we migrate on load.
   */
  sections: PostSection[];
  tags: Tag[];
  folder: string;
  createdAt: number;
  updatedAt: number;
  published: boolean;
  replyToId?: string | null;
  hearts: number;
  aiModel?: string | null;
};

export type DraftState = {
  title: string;
  sections: PostSection[];
  tags: Tag[];
  folder: string;
  replyToId: string | null;
  aiModel: string;
};
