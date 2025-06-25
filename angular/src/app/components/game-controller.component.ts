import { Component } from '@angular/core';
import { UIBoardComponent } from './ui-board.component';

@Component({
  selector: 'app-game-controller',
  standalone: true,
  imports: [UIBoardComponent],
  template: `<app-ui-board></app-ui-board>`,
})
export class GameControllerComponent {}
