import React from 'react';
import { UIBoard } from './UIBoard';
import { RoundResultModal } from './RoundResultModal';
import { FinalResultModal } from './FinalResultModal';
import { WinResultModal } from './WinResultModal';
import {
  useGame,
  maxKyokuForLength,
  GameLength,
} from '../game/store';

interface Props {
  gameLength: GameLength;
  showBorders?: boolean;
}

export const GameController: React.FC<Props> = ({ gameLength, showBorders = true }) => {
  const game = useGame(gameLength);
  const maxKyoku = maxKyokuForLength(gameLength);

  return (
    <div className="p-2 flex flex-col gap-4">
      <UIBoard
        players={game.players}
        dora={game.dora}
        kyoku={game.kyoku}
        wallCount={game.wall.length}
        kyotaku={game.riichiPool}
        honba={game.honba}
        onDiscard={game.handleDiscard}
        isMyTurn={game.turn === 0 && !game.players[0]?.isAI}
        shanten={game.shanten}
        lastDiscard={game.lastDiscard}
        callOptions={!game.players[0]?.isAI ? game.callOptions ?? undefined : undefined}
        onCallAction={!game.players[0]?.isAI ? game.handleCallAction : undefined}
        onRiichi={!game.players[0]?.isAI ? game.handleRiichi : undefined}
        selfKanOptions={!game.players[0]?.isAI ? game.selfKanOptions ?? undefined : undefined}
        onSelfKan={!game.players[0]?.isAI ? game.handleSelfKan : undefined}
        chiOptions={!game.players[0]?.isAI ? game.chiTileOptions ?? undefined : undefined}
        onChi={!game.players[0]?.isAI ? game.handleChiSelect : undefined}
        tsumoOption={!game.players[0]?.isAI ? game.tsumoOption : false}
        onTsumo={!game.players[0]?.isAI ? game.handleTsumo : undefined}
        onTsumoPass={!game.players[0]?.isAI ? game.handleTsumoPass : undefined}
        ronOption={!game.players[0]?.isAI ? !!game.ronCandidate : false}
        onRon={!game.players[0]?.isAI ? game.handleRon : undefined}
        onRonPass={!game.players[0]?.isAI ? game.handleRonPass : undefined}
        playerIsAI={game.playerIsAI}
        onToggleAI={game.togglePlayerAI}
        showBorders={showBorders}
      />
      <div className="mt-2">{game.message}</div>
      <button className="px-2 py-1 bg-gray-200 rounded" onClick={game.handleDownloadLog}>
        ログダウンロード
      </button>
      <button className="ml-2 px-2 py-1 bg-gray-200 rounded" onClick={game.handleDownloadMjaiLog}>
        MJAIログダウンロード
      </button>
      <div className="my-2 flex items-center gap-2">
        <label htmlFor="preset" className="whitespace-nowrap">プリセット</label>
        <select
          id="preset"
          aria-label="プリセット"
          className="border px-2 py-1"
          value={game.preset}
          onChange={e => game.setPreset(e.target.value as any)}
        >
          <option value="basic">基本形</option>
          <option value="multiCalls">複数鳴き</option>
          <option value="kanVariants">カン各種</option>
          <option value="longRiver">捨て牌19枚</option>
          <option value="allFuro">全員鳴き</option>
        </select>
      </div>
      <textarea
        aria-label="盤面入力"
        className="w-full h-40 p-1 border font-mono"
        value={game.boardInput}
        onChange={e => game.setBoardInput(e.target.value)}
      />
      <button className="px-2 py-1 bg-gray-200 rounded" onClick={game.handleLoadBoard}>
        盤面読み込み
      </button>
      {game.winResult && (
        <WinResultModal
          {...game.winResult}
          nextLabel={game.kyoku >= maxKyoku ? '結果発表へ' : undefined}
          onNext={() => {
            const dealerWon = game.winResult!.winner === 0;
            game.setWinResult(null);
            game.nextKyoku(dealerWon);
          }}
        />
      )}
      {game.roundResult && (
        <RoundResultModal
          results={game.roundResult.results}
          nextLabel={game.kyoku >= maxKyoku ? '結果発表へ' : undefined}
          onNext={() => {
            game.setRoundResult(null);
            game.nextKyoku(true);
          }}
        />
      )}
      {game.phase === 'end' && (
        <FinalResultModal players={game.players} onReplay={game.handleRestart} />
      )}
    </div>
  );
};

export { maxKyokuForLength };
