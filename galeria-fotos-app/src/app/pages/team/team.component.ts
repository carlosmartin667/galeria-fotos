import { AfterViewInit, Component, inject } from '@angular/core';

import { TemplateScriptsService } from '../../core/template-scripts.service';

@Component({
  selector: 'app-team-page',
  standalone: false,
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements AfterViewInit {
  private readonly templateScripts = inject(TemplateScriptsService);

  ngAfterViewInit(): void {
    this.templateScripts.refresh();
  }
}
