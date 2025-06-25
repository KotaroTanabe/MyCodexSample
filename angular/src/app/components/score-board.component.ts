import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-score-board',
  standalone: true,
  template: `
    <div class="flex items-baseline gap-2 p-2 bg-gray-200 rounded-lg shadow">
      <span class="font-bold">{{ kyokuLabel }}</span>
      <span class="text-sm">残り{{ wallCount }}</span>
      <span class="text-sm">{{ honba }}本場</span>
      <span class="text-sm">供託{{ kyotaku }}</span>
    </div>
  `,
})
export class ScoreBoardComponent {
  @Input({ required: true }) kyoku = 1;
  @Input({ required: true }) wallCount = 0;
  @Input({ required: true }) kyotaku = 0;
  @Input({ required: true }) honba = 0;

  get kyokuLabel(): string {
    const labels = ['東1局', '東2局', '東3局', '東4局', '南1局', '南2局', '南3局', '南4局'];
    return labels[this.kyoku - 1] || '';
  }
}
