export type DevToolsCategory = 'info' | 'errors' | 'payloads' | 'audit';

export interface DevToolsAction {
  key: string;
  label: string;
  endpoint: string;
  category: DevToolsCategory;
  expectedStatus: number;
  danger?: boolean;
}

export interface DevToolsRunResult {
  action: DevToolsAction;
  ok: boolean;
  status: number;
  message: string;
  correlationId?: string;
  sanitizedPayload: string;
  receivedAt: string;
}

export interface DevToolsPayloadShape {
  data?: unknown;
  items?: unknown[] | null;
  correlationId?: string;
  traceId?: string;
  [key: string]: unknown;
}
