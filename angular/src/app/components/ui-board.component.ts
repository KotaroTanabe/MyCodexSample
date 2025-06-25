import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../game.service';
import { ScoreBoardComponent } from './score-board.component';

@Component({
  selector: 'app-ui-board',
  standalone: true,
  imports: [CommonModule, ScoreBoardComponent],
  template: `
    <app-score-board
      [kyoku]="1"
      [wallCount]="70"
      [kyotaku]="0"
      [honba]="0"
    ></app-score-board>
    <ul>
      <li *ngFor="let p of game.players$ | async">
        {{ p.name }}: {{ p.score }}
      </li>
    </ul>
  `,
})
export class UIBoardComponent {
  // eslint-disable-next-line no-unused-vars
  constructor(public readonly game: GameService) {}
}
