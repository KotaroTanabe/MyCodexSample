export interface RuleStatus {
  term: string;
  implemented: boolean;
}

export const RULE_STATUS: RuleStatus[] = [
  { term: 'リーチ', implemented: true },
  { term: 'ダブルリーチ', implemented: true },
  { term: 'ドラ', implemented: true },
  { term: '本場', implemented: true },
  { term: '裏ドラ', implemented: true },
  { term: '一発', implemented: true },
];
