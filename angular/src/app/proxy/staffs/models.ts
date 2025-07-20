import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateStaffDto {
  organizationUnitId?: string;
  managerId?: number;
  code: string;
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  bankName?: string;
  bankAddress?: string;
}

export interface StaffDto extends AuditedEntityDto<number> {
  organizationUnitId?: string;
  managerId?: number;
  code?: string;
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  bankName?: string;
  bankAddress?: string;
}

export interface StaffSimpleDto {
  id: number;
  name?: string;
}

export interface UpdateStaffDto {
  organizationUnitId?: string;
  managerId?: number;
  code: string;
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  bankName?: string;
  bankAddress?: string;
}
