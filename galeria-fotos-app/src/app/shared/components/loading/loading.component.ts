import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 mb-0 text-muted">{{ text }}</p>
    </div>
  `
})
export class LoadingComponent {
  @Input() text = 'Cargando...';
}
