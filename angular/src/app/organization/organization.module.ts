import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationComponent } from './organization.component';

import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    OrganizationComponent
  ],
  imports: [
    SharedModule,
    OrganizationRoutingModule,
    TreeModule,
    ButtonModule,
    CommonModule,
  ]
})
export class OrganizationModule { }
