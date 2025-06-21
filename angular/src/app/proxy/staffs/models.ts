import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateStaffDto {
  organizationId: number;
  managerId?: number;
  code: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  bankAccountName: string;
  bankAccountNo: string;
  bankName: string;
  bankAddress: string;
}

export interface StaffDto extends AuditedEntityDto<number> {
  organizationId: number;
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

export interface UpdateStaffDto {
  organizationId: number;
  managerId?: number;
  code: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  bankAccountName: string;
  bankAccountNo: string;
  bankName: string;
  bankAddress: string;
}
