import type { CreateOrganizationUnitDto, OrganizationUnitDto, OrganizationUnitTreeDto, UpdateOrganizationUnitDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrganizationUnitService {
  apiName = 'Default';
  

  create = (input: CreateOrganizationUnitDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationUnitDto>({
      method: 'POST',
      url: '/api/app/organization-unit',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/organization-unit/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationUnitDto>({
      method: 'GET',
      url: `/api/app/organization-unit/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<OrganizationUnitDto>>({
      method: 'GET',
      url: '/api/app/organization-unit',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getTree = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationUnitTreeDto[]>({
      method: 'GET',
      url: '/api/app/organization-unit/tree',
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: UpdateOrganizationUnitDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationUnitDto>({
      method: 'PUT',
      url: `/api/app/organization-unit/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
