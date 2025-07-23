import React from 'react';
import { UIBoard } from './UIBoard';
import { RoundResultModal } from './RoundResultModal';
import { FinalResultModal } from './FinalResultModal';
import { WinResultModal } from './WinResultModal';
import { GameToolsModal } from './GameToolsModal';
import {
  useGame,
  maxKyokuForLength,
  GameLength,
} from '../game/store';

interface Props {
  gameLength: GameLength;
  red?: number;
  showBorders?: boolean;
  toolsOpen?: boolean;
  onCloseTools?: () => void;
}

export const GameController: React.FC<Props> = ({
  gameLength,
  red = 0,
  showBorders = true,
  toolsOpen = false,
  onCloseTools,
}) => {
  const game = useGame(gameLength, red);
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
      <GameToolsModal
        isOpen={toolsOpen}
        onClose={onCloseTools ?? (() => {})}
        onDownloadLog={game.handleDownloadLog}
        onDownloadMjaiLog={game.handleDownloadMjaiLog}
        preset={game.preset}
        setPreset={game.setPreset}
        boardInput={game.boardInput}
        setBoardInput={game.setBoardInput}
        onLoadBoard={game.handleLoadBoard}
        advancedAI={game.advancedAI}
        onToggleAdvancedAI={game.toggleAdvancedAI}
      />
      {game.winResult && (
        <WinResultModal
          {...game.winResult}
          nextLabel={game.kyoku >= maxKyoku ? '結果発表へ' : undefined}
          onCopyTenhou={game.handleCopyTenhouLog}
          tenhouUrl={game.tenhouUrl ?? undefined}
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
          onCopyTenhou={game.handleCopyTenhouLog}
          tenhouUrl={game.tenhouUrl ?? undefined}
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
