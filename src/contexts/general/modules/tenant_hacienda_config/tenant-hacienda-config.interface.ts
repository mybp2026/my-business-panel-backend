export interface ITenantHaciendaCredentials {
  haciendaUsername: string;
  haciendaPassword: string;
  haciendaClientId: string;
  p12Base64: string;
  p12Password: string;
}

export interface ITenantHaciendaCredentialsInput {
  haciendaUsername: string;
  haciendaPassword?: string;
  haciendaClientId: string;
  p12Base64?: string;
  p12Password?: string;
}
