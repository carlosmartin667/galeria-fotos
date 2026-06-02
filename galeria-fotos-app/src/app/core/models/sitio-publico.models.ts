import { Evento } from './evento.models';
import { PreguntaFrecuente } from './faq.models';
import { PortfolioItem } from './portfolio.models';
import { ServicioFotografia } from './servicio.models';

export interface PerfilFotografa {
  id?: string;
  nombre?: string;
  titulo?: string | null;
  descripcion?: string | null;
  biografia?: string | null;
  whatsApp?: string | null;
  whatsAppUrl?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tikTok?: string | null;
  sitioWeb?: string | null;
  correoPublico?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  pais?: string | null;
  fotoPerfilUrl?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  textoBienvenida?: string | null;
  activa?: boolean;
}

export interface SitioHome {
  perfil?: PerfilFotografa;
  servicios?: ServicioFotografia[];
  portfolio?: PortfolioItem[];
  preguntasFrecuentes?: PreguntaFrecuente[];
  eventosRecientes?: Evento[];
}

export interface SitioContacto {
  perfil?: PerfilFotografa;
  whatsAppUrl?: string | null;
  correoPublico?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tikTok?: string | null;
  sitioWeb?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  pais?: string | null;
  textoBienvenida?: string | null;
}
