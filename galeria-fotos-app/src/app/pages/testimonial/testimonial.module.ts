import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TestimonialComponent } from './testimonial.component';

@NgModule({
  declarations: [TestimonialComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: TestimonialComponent }
    ])
  ]
})
export class TestimonialModule {}
