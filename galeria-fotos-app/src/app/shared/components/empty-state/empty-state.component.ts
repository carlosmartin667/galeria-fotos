import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="app-empty">{{ text }}</div>`
})
export class EmptyStateComponent {
  @Input() text = 'No hay registros para mostrar.';
}
