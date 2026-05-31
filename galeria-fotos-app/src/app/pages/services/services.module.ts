import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ServicesComponent } from './services.component';

@NgModule({
  declarations: [ServicesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: ServicesComponent }
    ])
  ]
})
export class ServicesModule {}
