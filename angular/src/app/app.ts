import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameControllerComponent } from './components/game-controller.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameControllerComponent],
  template: `<app-game-controller></app-game-controller>`,
  styleUrl: './app.css'
})
export class App {
  protected title = 'angular-ui';
}
