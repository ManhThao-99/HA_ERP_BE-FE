import type { CreateStaffDto, StaffDto, StaffSimpleDto, UpdateStaffDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  apiName = 'Default';
  

  create = (input: CreateStaffDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StaffDto>({
      method: 'POST',
      url: '/api/app/staff',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/staff/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StaffDto>({
      method: 'GET',
      url: `/api/app/staff/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StaffDto>>({
      method: 'GET',
      url: '/api/app/staff',
    },
    { apiName: this.apiName,...config });
  

  getListByOrganization = (id: string, input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<StaffDto>>({
      method: 'GET',
      url: `/api/app/staff/${id}/by-organization`,
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getManagerById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, StaffSimpleDto[]>({
      method: 'GET',
      url: `/api/app/staff/${id}/manager`,
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: UpdateStaffDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'PUT',
      url: `/api/app/staff/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
