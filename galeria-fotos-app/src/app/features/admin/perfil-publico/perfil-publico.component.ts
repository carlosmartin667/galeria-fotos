import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { AdminPerfilPublico } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-perfil-publico-admin',
  standalone: true,
  imports: [NgIf, ErrorAlertComponent, LoadingComponent],
  templateUrl: './perfil-publico.component.html'
})
export class PerfilPublicoComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  perfil: AdminPerfilPublico | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loading = true;

    this.adminService.getPerfilPublico().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar el perfil publico.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
