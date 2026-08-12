import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `@if (message) {
    <div class="alert alert-danger">{{ message }}</div>
  }`,
})
export class ErrorAlertComponent {
  @Input() message = '';
}
