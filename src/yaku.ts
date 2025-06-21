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
  {
    name: 'Pinfu',
    description: '順子のみで雀頭が役牌でない形で和了',
    hanClosed: 1,
    hanOpen: 0,
  },
  {
    name: 'Iipeiko',
    description: '同一順子を2組含む形',
    hanClosed: 1,
    hanOpen: 0,
  },
  {
    name: 'Chiitoitsu',
    description: '七つの対子だけで構成された手',
    hanClosed: 2,
    hanOpen: 0,
  },
];
