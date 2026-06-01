import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PaginationQuery } from '../../../core/models/pagination.models';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './pagination-controls.component.html',
  styleUrl: './pagination-controls.component.css'
})
export class PaginationControlsComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() totalPages = 1;
  @Input() hasPreviousPage = false;
  @Input() hasNextPage = false;
  @Input() all = false;
  @Input() disabled = false;

  @Output() paginationChange = new EventEmitter<PaginationQuery>();

  readonly pageSizes = [5, 10, 20, 40];

  get selectedSize(): string {
    return this.all ? 'all' : String(this.pageSize);
  }

  set selectedSize(value: string) {
    if (value === 'all') {
      this.paginationChange.emit({ page: 1, pageSize: this.pageSize || 10, all: true });
      return;
    }

    this.paginationChange.emit({ page: 1, pageSize: Number(value), all: false });
  }

  previous(): void {
    if (this.disabled || this.all || !this.hasPreviousPage) {
      return;
    }

    this.paginationChange.emit({ page: Math.max(1, this.page - 1), pageSize: this.pageSize, all: false });
  }

  next(): void {
    if (this.disabled || this.all || !this.hasNextPage) {
      return;
    }

    this.paginationChange.emit({ page: this.page + 1, pageSize: this.pageSize, all: false });
  }
}
