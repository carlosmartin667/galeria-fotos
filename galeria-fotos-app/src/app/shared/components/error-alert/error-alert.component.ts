import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [NgIf],
  template: `<div *ngIf="message" class="alert alert-danger">{{ message }}</div>`
})
export class ErrorAlertComponent {
  @Input() message = '';
}
