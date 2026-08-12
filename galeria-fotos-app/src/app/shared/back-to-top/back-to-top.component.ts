import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  templateUrl: './back-to-top.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './back-to-top.component.css',
})
export class BackToTopComponent {}
