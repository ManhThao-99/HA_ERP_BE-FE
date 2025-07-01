import { Environment } from '@abp/ng.core';

const baseUrl = 'http://160.250.132.121:5003';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'HA_ERP',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'http://160.250.132.121:5002/', // THÊM dấu / cuối
    redirectUri: baseUrl,
    clientId: 'HA_ERP_App',
    responseType: 'code',
    scope: 'offline_access HA_ERP',
    requireHttps: false
  },
  apis: {
    default: {
      url: 'http://160.250.132.121:5002',
      rootNamespace: 'HA_ERP',
    },
  },
} as Environment;
