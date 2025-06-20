import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'HA_ERP',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44335/',
    redirectUri: baseUrl,
    clientId: 'HA_ERP_App',
    responseType: 'code',
    scope: 'offline_access HA_ERP',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44335',
      rootNamespace: 'HA_ERP',
    },
  },
} as Environment;
