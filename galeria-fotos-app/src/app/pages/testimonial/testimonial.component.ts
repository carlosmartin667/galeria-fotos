import { AfterViewInit, Component, inject } from '@angular/core';

import { TemplateScriptsService } from '../../core/template-scripts.service';

@Component({
  selector: 'app-testimonial-page',
  standalone: false,
  templateUrl: './testimonial.component.html',
  styleUrl: './testimonial.component.css'
})
export class TestimonialComponent implements AfterViewInit {
  private readonly templateScripts = inject(TemplateScriptsService);

  ngAfterViewInit(): void {
    this.templateScripts.refresh();
  }
}
