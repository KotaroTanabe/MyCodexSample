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
    name: 'Menzen Tsumo',
    description: '門前で自摸和了する',
    hanClosed: 1,
    hanOpen: 0,
  },
  {
    name: 'Pinfu',
    description: '順子のみで雀頭は役牌以外、両面待ちの形',
    hanClosed: 1,
    hanOpen: 0,
  },
  {
    name: 'Iipeiko',
    description: '同一の順子を2組揃える',
    hanClosed: 1,
    hanOpen: 0,
  },
  {
    name: 'Chiitoitsu',
    description: '同じ牌の対子を7組揃える',
    hanClosed: 2,
    hanOpen: 0,
  },
  {
    name: 'Toitoi',
    description: '全ての面子を刻子または槓子で揃える',
    hanClosed: 2,
    hanOpen: 2,
  },
  {
    name: 'Sanankou',
    description: '暗刻(暗槓)を3組作る',
    hanClosed: 2,
    hanOpen: 2,
  },
  {
    name: 'Sanshoku Doujun',
    description: '萬子・筒子・索子で同じ数の順子を揃える',
    hanClosed: 2,
    hanOpen: 1,
  },
  {
    name: 'San Doukou',
    description: '萬子・筒子・索子で同じ数の刻子を揃える',
    hanClosed: 2,
    hanOpen: 2,
  },
  {
    name: 'Ittsu',
    description: '同一色で123・456・789の順子を揃える',
    hanClosed: 2,
    hanOpen: 1,
  },
  {
    name: 'Chanta',
    description: '全ての面子と雀頭に么九牌を含む',
    hanClosed: 2,
    hanOpen: 1,
  },
  {
    name: 'Honitsu',
    description: '1種類の数牌と字牌のみで構成する',
    hanClosed: 3,
    hanOpen: 2,
  },
  {
    name: 'Chinitsu',
    description: '1種類の数牌だけで構成する',
    hanClosed: 6,
    hanOpen: 5,
  },
  {
    name: 'Ippatsu',
    description: 'リーチ後一巡以内に和了',
    hanClosed: 1,
    hanOpen: 0,
  },
  {
    name: 'Rinshan Kaihou',
    description: '槓の後に引いた牌でツモ和了',
    hanClosed: 1,
    hanOpen: 1,
  },
  {
    name: 'Chankan',
    description: '加槓の牌をロン和了',
    hanClosed: 1,
    hanOpen: 1,
  },
  {
    name: 'Haitei',
    description: '最後の自摸牌でツモ和了',
    hanClosed: 1,
    hanOpen: 1,
  },
  {
    name: 'Houtei',
    description: '最後の捨て牌でロン和了',
    hanClosed: 1,
    hanOpen: 1,
  },
  {
    name: 'Ura Dora',
    description: '裏ドラによる加算',
    hanClosed: 1,
    hanOpen: 0,
  },
];
