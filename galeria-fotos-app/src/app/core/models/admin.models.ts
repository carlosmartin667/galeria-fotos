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

export type AdminDashboardValue = string | number | boolean | null | AdminDashboardValue[] | { [key: string]: AdminDashboardValue };

export interface AdminDashboard {
  eventosActivos?: number;
  fotosSubidas?: number;
  pedidosPendientes?: number;
  pedidosPagados?: number;
  ingresosDelMes?: number;
  clientesRegistrados?: number;
  sesionesPrivadasActivas?: number;
  fotosMasCompradas?: AdminDashboardValue[];
  paquetesMasVendidos?: AdminDashboardValue[];
  ultimosPedidos?: AdminDashboardValue[];
  [key: string]: AdminDashboardValue | undefined;
}
