import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EventsComponent } from './events.component';

@NgModule({
  declarations: [EventsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: EventsComponent }
    ])
  ]
})
export class EventsModule {}
