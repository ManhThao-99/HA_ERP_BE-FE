import type { EntityDto } from '@abp/ng.core';

export interface CreateOrganizationUnitDto {
  displayName: string;
  parentId?: string;
}

export interface OrganizationUnitDto extends EntityDto<string> {
  code?: string;
  displayName?: string;
  parentId?: string;
  childrenCount?: number;
}

export interface OrganizationUnitTreeDto {
  id?: string;
  displayName?: string;
  parentId?: string;
  children: OrganizationUnitTreeDto[];
}

export interface UpdateOrganizationUnitDto {
  displayName: string;
  parentId?: string;
}
