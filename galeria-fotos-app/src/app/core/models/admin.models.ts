export interface AdminPerfilPublico {
  nombre: string;
  descripcion?: string;
  whatsApp?: string;
  instagram?: string;
  correoPublico?: string;
  direccion?: string;
}

export interface ActualizarAdminPerfilRequest {
  nombre: string;
  descripcion?: string;
  whatsApp?: string;
  instagram?: string;
  correoPublico?: string;
  direccion?: string;
}
