import { NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  imports: [NgIf],
  templateUrl: './image-lightbox.component.html',
  styleUrl: './image-lightbox.component.css'
})
export class ImageLightboxComponent {
  @Input() imageUrl = '';
  @Input() title = '';
  @Input() open = false;

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  stop(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close();
    }
  }
}
