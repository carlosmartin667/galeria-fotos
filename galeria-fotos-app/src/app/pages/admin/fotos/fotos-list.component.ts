import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FotosService } from '../../../api/fotos.service';
import { Foto } from '../../../api/models';

@Component({
  selector: 'app-fotos-list',
  standalone: false,
  templateUrl: './fotos-list.component.html'
})
export class FotosListComponent implements OnInit {
  private readonly fotosService = inject(FotosService);
  private readonly route = inject(ActivatedRoute);

  eventoId = '';
  fotos: Foto[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.queryParamMap.get('eventoId') ?? '';

    if (this.eventoId) {
      this.load();
    }
  }

  load(): void {
    if (!this.eventoId.trim()) {
      this.error = 'Ingresa un eventoId para consultar las fotos.';
      this.fotos = [];
      return;
    }

    this.loading = true;
    this.error = '';

    this.fotosService.listByEvento(this.eventoId.trim()).subscribe({
      next: (fotos) => {
        this.fotos = fotos;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.loading = false;
      }
    });
  }

  deleteFoto(foto: Foto): void {
    if (!confirm(`Eliminar foto "${foto.nombreArchivo}"?`)) {
      return;
    }

    this.fotosService.delete(foto.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = this.message(error);
      }
    });
  }

  trackById(_: number, foto: Foto): string {
    return foto.id;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar las fotos.';
  }
}
