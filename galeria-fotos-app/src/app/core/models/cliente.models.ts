export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  documento?: string;
}

export interface CrearClienteRequest {
  nombre: string;
  email: string;
  telefono?: string;
  documento?: string;
}

export interface ActualizarClienteRequest {
  nombre: string;
  email: string;
  telefono?: string;
  documento?: string;
}
