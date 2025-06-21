import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationComponent } from './organization.component';


@NgModule({
  declarations: [
    OrganizationComponent
  ],
  imports: [
    SharedModule,
    OrganizationRoutingModule
  ]
})
export class OrganizationModule { }
