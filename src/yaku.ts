export interface Yaku {
  name: string;
  description: string;
  hanClosed: number; // 門前時の翻数
  hanOpen: number;   // 副露時の翻数
}

export const YAKU_LIST: Yaku[] = [
  {
    name: 'Tanyao',
    description: '数牌の2〜8のみで手を構成する',
    hanClosed: 1,
    hanOpen: 1,
  },
  {
    name: 'Yakuhai',
    description: '場風・自風・三元牌の刻子または槓子',
    hanClosed: 1,
    hanOpen: 1,
  },
];
