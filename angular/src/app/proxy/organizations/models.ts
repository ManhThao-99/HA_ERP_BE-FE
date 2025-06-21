import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateOrganizationDto {
  code: string;
  name: string;
}

export interface GetListOrganizationDto extends PagedAndSortedResultRequestDto {
  filter?: string;
}

export interface OrganizationDto extends EntityDto<number> {
  code?: string;
  name?: string;
}

export interface UpdateOrganizationDto {
  code: string;
  name: string;
}
