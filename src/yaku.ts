export interface Yaku {
  name: string;
  description: string;
}

export const YAKU_LIST: Yaku[] = [
  { name: '立直 (リーチ)', description: '門前で聴牌し宣言を行うと成立する' },
  { name: '門前清自摸和 (ツモ)', description: '門前でツモあがりしたとき' },
  { name: '断么九 (タンヤオ)', description: '数牌の2〜8のみで手を構成する' },
  { name: '一発 (イッパツ)', description: 'リーチ後1巡以内に和了したとき' },
  { name: '平和 (ピンフ)', description: '順子のみで雀頭が役牌でない形で和了' },
  { name: '役牌 (ヤクハイ)', description: '場風・自風・三元牌の刻子または槓子' }
];
