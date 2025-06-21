import type { CreateOrganizationDto, GetListOrganizationDto, OrganizationDto, UpdateOrganizationDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  apiName = 'Default';
  

  create = (input: CreateOrganizationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationDto>({
      method: 'POST',
      url: '/api/app/organization',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/organization/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationDto>({
      method: 'GET',
      url: `/api/app/organization/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetListOrganizationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<OrganizationDto>>({
      method: 'GET',
      url: '/api/app/organization',
      params: { filter: input.filter, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: UpdateOrganizationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'PUT',
      url: `/api/app/organization/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
