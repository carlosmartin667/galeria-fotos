import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PaginationQuery } from '../../../core/models/pagination.models';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pagination-controls.component.html',
  styleUrl: './pagination-controls.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  get safeTotalPages(): number {
    return Math.max(this.totalPages || 1, 1);
  }

  get canPrevious(): boolean {
    return !this.disabled && !this.all && this.page > 1 && this.hasPreviousPage;
  }

  get canNext(): boolean {
    return !this.disabled && !this.all && this.page < this.safeTotalPages && this.hasNextPage;
  }

  get visiblePages(): number[] {
    const total = this.safeTotalPages;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.page - half);
    let end = start + maxVisible - 1;

    if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

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

  first(): void {
    this.goToPage(1);
  }

  previous(): void {
    this.goToPage(this.page - 1);
  }

  next(): void {
    this.goToPage(this.page + 1);
  }

  last(): void {
    this.goToPage(this.safeTotalPages);
  }

  goToPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.safeTotalPages);

    if (this.disabled || this.all || nextPage === this.page) {
      return;
    }

    this.paginationChange.emit({ page: nextPage, pageSize: this.pageSize, all: false });
  }
}
