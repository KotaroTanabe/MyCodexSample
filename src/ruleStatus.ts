export interface RuleStatus {
  term: string;
  implemented: boolean;
}

export const RULE_STATUS: RuleStatus[] = [
  { term: 'リーチ', implemented: true },
  { term: 'ドラ', implemented: true },
  { term: '本場', implemented: false },
  { term: '裏ドラ', implemented: false },
  { term: '一発', implemented: false },
];
