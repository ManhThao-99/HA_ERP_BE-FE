import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService, OrganizationDto } from '@proxy/organizations';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';
import { forkJoin } from 'rxjs';
import { ToasterService } from '@abp/ng.theme.shared';
import { LocalizationService } from '@abp/ng.core';
import * as signalR from '@microsoft/signalr';
@Component({
  selector: 'app-organization',
  standalone: false,
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
  providers: [ListService],
})
export class OrganizationComponent implements OnInit {
  organization = { items: [], totalCount: 0 } as PagedResultDto<OrganizationDto>;

  form: FormGroup;

  selectedRows: OrganizationDto[] = [];
  selectedOrganization = {} as OrganizationDto;
  detailOrganization = {} as OrganizationDto;
  isModalOpen = false;
  isDetailModalOpen = false;

  query = {
    skipCount: 0,
    maxResultCount: 10,
    sorting: 'name',
    filter: '',
  };

  constructor(
    public readonly list: ListService,
    private organizationService: OrganizationService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private toaster: ToasterService,
    private localization: LocalizationService
  ) { }


  
  ngOnInit() {
    const organizationStreamCreator = query => this.organizationService.getList(query);

    this.list.hookToQuery(organizationStreamCreator).subscribe(response => {
      this.organization = response;
    });

    this.list.get();


    // ====== ĐOẠN TEST SIGNALR ======
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44335/signalr-hubs/organization', {
        // Nếu backend yêu cầu token:
        // accessTokenFactory: () => 'YOUR_ACCESS_TOKEN'
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log('SignalR connected!');
        // Join thử group với một organizationId (ví dụ: 1)
        connection.invoke('JoinOrganizationGroup', 17);
      })
      .catch(err => console.error('SignalR Connection Error: ', err));

    // Lắng nghe sự kiện realtime từ backend
    connection.on('OrganizationChanged', (action, organizationId) => {
      console.log('Realtime event:', action, organizationId);
      // Bạn có thể thử alert hoặc reload data ở đây nếu muốn
      // alert(`Organization ${organizationId} has been ${action}`);
    });
    // ====== HẾT ĐOẠN TEST SIGNALR ======
  }

  onPage(event: { offset: number }) {
    const page = event.offset;
    this.query.skipCount = page * this.query.maxResultCount;
    this.list.get();
  }

  createOrganization() {
    this.selectedOrganization = {} as OrganizationDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  editOrganization() {
    const id = this.selectedRows[0]?.id;
    if (!id) return;

    this.organizationService.get(id).subscribe(organization => {
      this.selectedOrganization = organization;
      this.buildForm();
      this.form.patchValue(organization);
      this.isModalOpen = true;
    });
  }

  handleAbpError(error: any) {
    // Standard ABP error format
    if (error?.error?.error) {
      const abpError = error.error.error;
      const message = this.localization.instant(abpError.code) || abpError.message;
      this.toaster.error(message);
      return;
    }

    // Non-standard but common error format
    if (error?.error) {
      const err = error.error;
      const message = this.localization.instant(err.code) || err.message;
      this.toaster.error(message);
      return;
    }

    // Raw error format
    if (error) {
      this.toaster.error(error.message || error.statusText || 'An unexpected error occurred');
    }
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    if (this.selectedOrganization?.id) {
      this.confirmation
        .info('Are you sure you want to update this item?', 'Are you sure?')
        .subscribe(status => {
          if (status === Confirmation.Status.confirm) {
            this.organizationService
              .update(this.selectedOrganization.id, this.form.value)
              .subscribe({
                next: () => {
                  this.toaster.success('Updated Successfully');
                  this.isModalOpen = false;
                  this.form.reset();
                  this.selectedRows = [];
                  this.list.get();
                },
                error: this.handleAbpError.bind(this),
              });
          }
        });
    } else {
      this.organizationService.create(this.form.value).subscribe({
        next: () => {
          this.toaster.success('Created successfully');
          this.isModalOpen = false;
          this.form.reset();
          this.list.get();
        },
        error: this.handleAbpError.bind(this),
      });
    }
  }

  delete() {
    this.confirmation
      .warn('Are you sure you want to delete this item?', '::AreYouSure')
      .subscribe(status => {
        if (status === Confirmation.Status.confirm) {
          const deleteRequests = this.selectedRows.map(row =>
            this.organizationService.delete(row.id)
          );

          forkJoin(deleteRequests).subscribe(() => {
            this.confirmation.success('Organization deleted!', 'Success!');
            this.selectedRows = [];
            this.list.get();
          });
        }
      });
  }

  view() {
    const id = this.selectedRows[0]?.id;
    if (!id) return;

    this.organizationService.get(id).subscribe(organization => {
      this.detailOrganization = organization;
      this.isDetailModalOpen = true;
    });
  }

  buildForm() {
    const OrganizationConsts = {
      MaxCodeLength: 10,
      MaxNameLength: 50,
    };

    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(OrganizationConsts.MaxCodeLength)]],
      name: ['', [Validators.required, Validators.maxLength(OrganizationConsts.MaxNameLength)]],
    });
  }
}
