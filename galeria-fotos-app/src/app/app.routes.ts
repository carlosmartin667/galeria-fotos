import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomeModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutModule)
  },
  {
    path: 'services',
    loadChildren: () => import('./pages/services/services.module').then((m) => m.ServicesModule)
  },
  { path: 'service', redirectTo: 'services', pathMatch: 'full' },
  {
    path: 'events',
    loadChildren: () => import('./pages/events/events.module').then((m) => m.EventsModule)
  },
  { path: 'event', redirectTo: 'events', pathMatch: 'full' },
  {
    path: 'menu',
    loadChildren: () => import('./pages/menu/menu.module').then((m) => m.MenuModule)
  },
  {
    path: 'book',
    loadChildren: () => import('./pages/book/book.module').then((m) => m.BookModule)
  },
  {
    path: 'blog',
    loadChildren: () => import('./pages/blog/blog.module').then((m) => m.BlogModule)
  },
  {
    path: 'team',
    loadChildren: () => import('./pages/team/team.module').then((m) => m.TeamModule)
  },
  {
    path: 'testimonial',
    loadChildren: () => import('./pages/testimonial/testimonial.module').then((m) => m.TestimonialModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact/contact.module').then((m) => m.ContactModule)
  },
  {
    path: 'not-found',
    loadChildren: () => import('./pages/not-found/not-found.module').then((m) => m.NotFoundModule)
  },
  { path: '404', redirectTo: 'not-found', pathMatch: 'full' },
  {
    path: '**',
    loadChildren: () => import('./pages/not-found/not-found.module').then((m) => m.NotFoundModule)
  }
];
