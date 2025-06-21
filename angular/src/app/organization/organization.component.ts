import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService, OrganizationDto } from '@proxy/organizations';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-organization',
  standalone: false,
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
  providers: [ListService]
})
export class OrganizationComponent implements OnInit {
  organization = { items: [], totalCount: 0 } as PagedResultDto<OrganizationDto>;

  form: FormGroup;

  selectedRows: OrganizationDto[] = [];
  selectedOrganization = {} as OrganizationDto;
  detailOrganization = {} as OrganizationDto;
  isModalOpen = false;
  isDetailModalOpen = false;

  constructor(public readonly list: ListService, private organizationService: OrganizationService, private fb: FormBuilder, private confirmation: ConfirmationService) {}

  ngOnInit() {
    const organizationStreamCreator = (query) => this.organizationService.getList(query);

    this.list.hookToQuery(organizationStreamCreator).subscribe((response) => {
      this.organization = response;
    });
  }

  createOrganization(){
    this.selectedOrganization = {} as OrganizationDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  editOrganization(){
    const id = this.selectedRows[0]?.id;
    if (!id) return;

    this.organizationService.get(id).subscribe(organization => {
      this.selectedOrganization = organization;
      this.buildForm();
      this.form.patchValue(organization);
      this.isModalOpen = true;
    });
  }

  save(){
    if (this.form.invalid) {
      return;
    }

    if (this.selectedOrganization?.id) {
      this.confirmation
        .info('Are you sure you want to update this item?', 'Are you sure?')
        .subscribe(status => {
          if (status === Confirmation.Status.confirm) {
            this.organizationService.update(this.selectedOrganization.id, this.form.value).subscribe(() => {
              this.isModalOpen = false;
              this.form.reset();
              this.selectedRows = [];
              this.list.get();
            });
          }
        });
    } else {
      this.organizationService.create(this.form.value).subscribe(() => {
        this.isModalOpen = false;
        this.form.reset();
        this.list.get();
      });
    }
  }

  delete(){
    this.confirmation.warn('Are you sure you want to delete this item?', '::AreYouSure').subscribe((status) => {
    if (status === Confirmation.Status.confirm) {
      const deleteRequests = this.selectedRows.map(row =>
        this.organizationService.delete(row.id)
      );

      forkJoin(deleteRequests).subscribe(() => {
        this.confirmation.success('Organization deleted!', 'Success!');
        this.selectedRows = [];
        this.list.get();
      })
    }
    });
  }

  view(){
    const id = this.selectedRows[0]?.id;
    if (!id) return;

    this.organizationService.get(id).subscribe((organization) => {
      this.detailOrganization = organization;
      this.isDetailModalOpen = true;
    });
  }

  buildForm(){
    const OrganizationConsts = {
      MaxCodeLength: 10,
      MaxNameLength: 50,
    };

    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(OrganizationConsts.MaxCodeLength)]],
      name: ['', [Validators.required, Validators.maxLength(OrganizationConsts.MaxNameLength)]],
    })
  }
}
