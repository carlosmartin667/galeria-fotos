import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `<div class="app-empty">{{ text }}</div>`
})
export class EmptyStateComponent {
  @Input() text = 'No hay registros para mostrar.';
}
