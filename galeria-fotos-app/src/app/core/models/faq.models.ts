export interface PreguntaFrecuente {
  id?: string;
  pregunta: string;
  respuesta: string;
  categoria?: string | null;
  orden?: number;
  activa?: boolean;
  fechaCreacionUtc?: string;
  fechaActualizacionUtc?: string | null;
}

export interface CrearPreguntaFrecuenteRequest {
  pregunta: string;
  respuesta: string;
  categoria?: string | null;
  orden: number;
  activa: boolean;
}

export interface ActualizarPreguntaFrecuenteRequest extends CrearPreguntaFrecuenteRequest {}
