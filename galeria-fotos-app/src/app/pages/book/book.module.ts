import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BookComponent } from './book.component';

@NgModule({
  declarations: [BookComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: BookComponent }
    ])
  ]
})
export class BookModule {}
