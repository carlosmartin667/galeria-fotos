import { PaginationControlsComponent } from './pagination-controls.component';

describe('PaginationControlsComponent', () => {
  it('shows at most five numeric pages around the current page', () => {
    const component = new PaginationControlsComponent();
    component.page = 6;
    component.totalPages = 12;

    expect(component.visiblePages).toEqual([4, 5, 6, 7, 8]);
  });

  it('emits all=true when selecting Todos', () => {
    const component = new PaginationControlsComponent();
    const emitted: unknown[] = [];
    component.paginationChange.subscribe((value) => emitted.push(value));

    component.selectedSize = 'all';

    expect(emitted).toEqual([{ page: 1, pageSize: 10, all: true }]);
  });
});
