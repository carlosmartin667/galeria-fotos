import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AdminShellComponent } from './admin-shell.component';
import { AdminLoginComponent } from './auth/admin-login.component';
import { ClienteFormComponent } from './clientes/cliente-form.component';
import { ClientesListComponent } from './clientes/clientes-list.component';
import { EventoFormComponent } from './eventos/evento-form.component';
import { EventosListComponent } from './eventos/eventos-list.component';
import { FotoFormComponent } from './fotos/foto-form.component';
import { FotosListComponent } from './fotos/fotos-list.component';
import { PedidoFormComponent } from './pedidos/pedido-form.component';
import { PedidosListComponent } from './pedidos/pedidos-list.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
      { path: 'login', component: AdminLoginComponent },
      { path: 'clientes', component: ClientesListComponent },
      { path: 'clientes/nuevo', component: ClienteFormComponent },
      { path: 'clientes/:id/editar', component: ClienteFormComponent },
      { path: 'eventos', component: EventosListComponent },
      { path: 'eventos/nuevo', component: EventoFormComponent },
      { path: 'eventos/:id/editar', component: EventoFormComponent },
      { path: 'fotos', component: FotosListComponent },
      { path: 'fotos/nuevo', component: FotoFormComponent },
      { path: 'fotos/:id/editar', component: FotoFormComponent },
      { path: 'pedidos', component: PedidosListComponent },
      { path: 'pedidos/nuevo', component: PedidoFormComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AdminShellComponent,
    AdminLoginComponent,
    ClientesListComponent,
    ClienteFormComponent,
    EventosListComponent,
    EventoFormComponent,
    FotosListComponent,
    FotoFormComponent,
    PedidosListComponent,
    PedidoFormComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class AdminModule {}
