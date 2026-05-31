import { AfterViewInit, Component, inject } from '@angular/core';

import { TemplateScriptsService } from '../../core/template-scripts.service';

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  private readonly templateScripts = inject(TemplateScriptsService);

  ngAfterViewInit(): void {
    this.templateScripts.refresh();
  }
}
