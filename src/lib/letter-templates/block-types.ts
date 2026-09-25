export type SectionType =
  | 'opening'
  | 'details'
  | 'role_responsibilities'
  | 'terms'
  | 'acceptance'
  | 'custom_rich_text';

export interface DetailField {
  id: string;
  label: string;
  value: string;
}

export interface BulletListItem {
  id: string;
  text: string;
}

export interface ClauseItem {
  id: string;
  title: string;
  content: string;
}

export interface SignatureParty {
  header: string;
  signatoryName: string;
  signatoryTitle: string;
  dateText: string;
}

export interface OpeningSection {
  id: string;
  type: 'opening';
  title: string;
  order: number;
  content: string;
}

export interface DetailsSection {
  id: string;
  type: 'details';
  title: string;
  order: number;
  fields: DetailField[];
}

export interface RoleResponsibilitiesSection {
  id: string;
  type: 'role_responsibilities';
  title: string;
  order: number;
  roleOverview: string;
  responsibilities: BulletListItem[];
}

export interface TermsSection {
  id: string;
  type: 'terms';
  title: string;
  order: number;
  clauses: ClauseItem[];
}

export interface AcceptanceSection {
  id: string;
  type: 'acceptance';
  title: string;
  order: number;
  content: string;
  signature: {
    employer: SignatureParty;
    candidate: SignatureParty;
  };
}

export interface CustomRichTextSection {
  id: string;
  type: 'custom_rich_text';
  title: string;
  order: number;
  content: string;
}

export type LetterSection =
  | OpeningSection
  | DetailsSection
  | RoleResponsibilitiesSection
  | TermsSection
  | AcceptanceSection
  | CustomRichTextSection;

// Legacy block types retained for backward compatibility
export type BlockType =
  | 'text'
  | 'heading'
  | 'details'
  | 'rich_text'
  | 'bullet_list'
  | 'clause'
  | 'signature';

export interface LetterBlockBase {
  id: string;
  type: BlockType;
  title: string;
  order: number;
}

export interface TextBlock extends LetterBlockBase {
  type: 'text';
  content: string;
}

export interface HeadingBlock extends LetterBlockBase {
  type: 'heading';
  level: 1 | 2 | 3;
  text: string;
}

export interface DetailsBlock extends LetterBlockBase {
  type: 'details';
  fields: DetailField[];
}

export interface RichTextBlock extends LetterBlockBase {
  type: 'rich_text';
  content: string;
}

export interface BulletListBlock extends LetterBlockBase {
  type: 'bullet_list';
  items: BulletListItem[];
}

export interface ClauseBlock extends LetterBlockBase {
  type: 'clause';
  clauseTitle: string;
  content: string;
}

export interface SignatureBlock extends LetterBlockBase {
  type: 'signature';
  employer: SignatureParty;
  candidate: SignatureParty;
}

export type LetterBlock =
  | TextBlock
  | HeadingBlock
  | DetailsBlock
  | RichTextBlock
  | BulletListBlock
  | ClauseBlock
  | SignatureBlock;

export interface LetterTemplateDocument {
  version: 1;
  sections?: LetterSection[];
  blocks?: LetterBlock[];
}
