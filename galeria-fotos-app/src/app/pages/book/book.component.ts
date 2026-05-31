import { AfterViewInit, Component, inject } from '@angular/core';

import { TemplateScriptsService } from '../../core/template-scripts.service';

@Component({
  selector: 'app-book-page',
  standalone: false,
  templateUrl: './book.component.html',
  styleUrl: './book.component.css'
})
export class BookComponent implements AfterViewInit {
  private readonly templateScripts = inject(TemplateScriptsService);

  ngAfterViewInit(): void {
    this.templateScripts.refresh();
  }
}
