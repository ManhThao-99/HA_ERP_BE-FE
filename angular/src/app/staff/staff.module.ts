import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { ListService } from '@abp/ng.core';
import { StaffRoutingModule } from './staff-routing.module';
import { StaffComponent } from './staff.component';


@NgModule({
  declarations: [
    StaffComponent
  ],
  imports: [
    CommonModule,
    StaffRoutingModule,
    SharedModule
  ],
  providers: [ListService]
})
export class StaffModule { }
