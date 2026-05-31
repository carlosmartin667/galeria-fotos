import { AfterViewInit, Component, inject } from '@angular/core';

import { TemplateScriptsService } from '../../core/template-scripts.service';

@Component({
  selector: 'app-not-found-page',
  standalone: false,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements AfterViewInit {
  private readonly templateScripts = inject(TemplateScriptsService);

  ngAfterViewInit(): void {
    this.templateScripts.refresh();
  }
}
