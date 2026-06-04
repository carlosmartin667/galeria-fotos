export interface CrearPreferenciaPagoRequest {
  pedidoId: string;
}

export interface PreferenciaPagoResponse {
  preferenceId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
}

export interface MercadoPagoWebhook {
  action?: string;
  type?: string;
  data?: {
    id?: string;
  };
}
