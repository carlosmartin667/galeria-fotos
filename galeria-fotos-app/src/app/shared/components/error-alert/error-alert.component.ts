import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [],
  template: `@if (message) {
    <div class="alert alert-danger">{{ message }}</div>
  }`,
})
export class ErrorAlertComponent {
  @Input() message = '';
}
