import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Player {
  name: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly players$ = new BehaviorSubject<Player[]>([
    { name: '自分', score: 25000 },
    { name: '下家', score: 25000 },
    { name: '対面', score: 25000 },
    { name: '上家', score: 25000 },
  ]);
}
