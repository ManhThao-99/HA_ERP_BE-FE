import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationService, OrganizationDto } from '@proxy/organizations';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';
import { forkJoin } from 'rxjs';
import { ToasterService } from '@abp/ng.theme.shared';
import { LocalizationService } from '@abp/ng.core';
import * as signalR from '@microsoft/signalr';
import { StaffDto, StaffService, StaffSimpleDto } from '@proxy/staffs';
@Component({
  selector: 'app-organization',
  standalone: false,
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
  providers: [ListService],
})
export class OrganizationComponent implements OnInit {
  // ========== ORGANIZATION ==========
  organization = { items: [], totalCount: 0 } as PagedResultDto<OrganizationDto>;
  allOrganizations: OrganizationDto[] = [];
  selectedOrganizationRows: OrganizationDto[] = [];
  selectedOrganization = {} as OrganizationDto;
  detailOrganization = {} as OrganizationDto;
  isModalOpen = false;
  isDetailModalOpen = false;
  selectedOrganizationId: number | null = null;
  form: FormGroup;

  // ========== STAFF ==========
  staff = { items: [], totalCount: 0 } as PagedResultDto<StaffDto>;
  selectedStaffRows: StaffDto[] = [];
  managers: StaffSimpleDto[] = [];
  staffForm: FormGroup;
  staffDetail = {} as StaffDto;
  isStaffModalOpen = false;
  isStaffDetailModalOpen = false;
  isShowingAllStaff = false;

  query = {
    skipCount: 0,
    maxResultCount: 10,
    sorting: 'name',
    filter: '',
  };

  staffQuery = {
  skipCount: 0,
  maxResultCount: 10,
  sorting: 'name',
};

  constructor(
    public readonly list: ListService,
    private organizationService: OrganizationService,
    private staffService: StaffService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private toaster: ToasterService,
    private localization: LocalizationService
  ) {}

  ngOnInit() {
    const organizationStreamCreator = query => this.organizationService.getList(query);

    this.list.hookToQuery(organizationStreamCreator).subscribe(response => {
      this.organization = response;
    });

    this.list.get();
    this.loadAllOrganizations();
    this.loadStaffList();

    // ====== ĐOẠN TEST SIGNALR ======
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44335/signalr-hubs/organization', {
        // Nếu backend yêu cầu token:
        // accessTokenFactory: () => 'YOUR_ACCESS_TOKEN'
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
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

  // ========== ORGANIZATION CRUD ==========
  onPage(event: { offset: number }) {
    const page = event.offset;
    this.query.skipCount = page * this.query.maxResultCount;
    this.list.get();
  }

  createOrganization() {
    this.selectedOrganization = {} as OrganizationDto;
    this.buildOrganizationForm();
    this.isModalOpen = true;
  }

  editOrganization() {
    const id = this.selectedOrganizationRows[0]?.id;
    if (!id) return;

    this.organizationService.get(id).subscribe(organization => {
      this.selectedOrganization = organization;
      this.buildOrganizationForm();
      this.form.patchValue(organization);
      this.isModalOpen = true;
    });
  }

  saveOrganization() {
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
                  this.selectedOrganizationRows = [];
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

  deleteOrganization() {
    const ids = this.selectedOrganizationRows.map(row => row.id);
    this.confirmation.warn('Delete?', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        forkJoin(ids.map(id => this.organizationService.delete(id))).subscribe(() => {
          this.toaster.success('Deleted');
          this.selectedOrganizationRows = [];
          this.list.get();
        });
      }
    });
  }

  viewOrganization() {
    const id = this.selectedOrganizationRows[0]?.id;
    if (!id) return;

    this.organizationService.get(id).subscribe(organization => {
      this.detailOrganization = organization;
      this.isDetailModalOpen = true;
    });
  }

  loadAllOrganizations() {
    this.organizationService.getList({ maxResultCount: 1000, skipCount: 0 }).subscribe(result => {
      this.allOrganizations = result.items;
    });
  }

  onOrganizationCheckboxChange({ selected }: { selected: OrganizationDto[] }) {
    console.log('Checkbox event fired! Selected rows:', selected);

  this.selectedOrganizationRows = selected;
  this.isShowingAllStaff = false;

  if (selected.length === 1) {
    this.selectedOrganizationId = selected[0].id;
    console.log('Organization ID set to:', this.selectedOrganizationId);
  } else {
    this.selectedOrganizationId = null;
  }

  this.staffQuery.skipCount = 0;
  this.loadStaffList();
}

  loadManagersForOrganization(organizationId: number) {
    this.staffService.getManagerById(organizationId).subscribe(managers => {
      this.managers = managers; // để đổ vào dropdown
    });
  }

  buildOrganizationForm() {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  // ========== STAFF CRUD ==========
  onStaffPage(event: { offset: number }) {
    this.staffQuery.skipCount = event.offset * this.staffQuery.maxResultCount;
    this.loadStaffList();
  }

  loadStaffList() {
    const queryParams = {
      skipCount: this.staffQuery.skipCount,
      maxResultCount: this.staffQuery.maxResultCount,
      sorting: this.staffQuery.sorting,
    };
  
    if (this.isShowingAllStaff) {
      this.staffService.getList(queryParams).subscribe(data => {
        this.staff = data;
      });
    } else if (this.selectedOrganizationId) {
      this.staffService.getListByOrganization(this.selectedOrganizationId, queryParams).subscribe(data => {
        this.staff = data;
      });
    } else {
      this.staff = { items: [], totalCount: 0 };
    }
  }

  showAllStaff() {
    this.isShowingAllStaff = true;
    this.selectedOrganizationRows = [];
    this.selectedOrganizationId = null;
    this.staffQuery.skipCount = 0;
    this.loadStaffList();
  }

  createStaff() {
    this.selectedStaffRows = [];
    this.staffForm = this.buildStaffForm();
    this.isStaffModalOpen = true;

    if (this.selectedOrganizationRows.length === 1) {
      this.staffForm.patchValue({ organizationId: this.selectedOrganizationId });
      this.loadManagersForOrganization(this.selectedOrganizationId);
    }
  }

  editStaff() {
    const id = this.selectedStaffRows[0]?.id;
    if (!id) return;
    this.staffService.get(id).subscribe(staff => {
      this.staffForm = this.buildStaffForm();
      this.staffForm.patchValue(staff);
      this.isStaffModalOpen = true;

      if (staff.organizationId) {
        this.loadManagersForOrganization(staff.organizationId);
      }
    });
  }

  buildStaffForm(): FormGroup {
    return this.fb.group({
      organizationId: [null, Validators.required],
      managerId: [null],
      code: ['', [Validators.required, Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      mobile: ['', [Validators.required, Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      address: ['', [Validators.required, Validators.maxLength(255)]],
      bankAccountName: ['', [Validators.required, Validators.maxLength(100)]],
      bankAccountNo: ['', [Validators.required, Validators.maxLength(20)]],
      bankName: ['', [Validators.required, Validators.maxLength(100)]],
      bankAddress: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }

  saveStaff() {
    this.staffForm.markAllAsTouched();
    if (this.staffForm.invalid) {
      return;
    }
  
    const staffIdToUpdate = this.selectedStaffRows[0]?.id;
  
    if (staffIdToUpdate) {
      // UPDATE
      this.confirmation.info('Are you sure you want to update this item?', 'Are you sure?').subscribe(status => {
        if (status === Confirmation.Status.confirm) {
          this.staffService.update(staffIdToUpdate, this.staffForm.value).subscribe({
            next: () => {
              this.toaster.success('Updated successfully');
              this.isStaffModalOpen = false;
              this.selectedStaffRows = [];
              this.loadStaffList();
            },
            error: this.handleAbpError.bind(this),
          });
        }
      });
    } else {
      // CREATE
      this.staffService.create(this.staffForm.value).subscribe({
        next: () => {
          this.toaster.success('Created successfully');
          this.isStaffModalOpen = false;
          this.loadStaffList();
        },
        error: this.handleAbpError.bind(this),
      });
    }
  }

  deleteStaff() {
    this.confirmation
      .warn('Are you sure you want to delete this item?', '::AreYouSure')
      .subscribe(status => {
        if (status === Confirmation.Status.confirm) {
          const deleteRequests = this.selectedStaffRows.map(row =>
            this.staffService.delete(row.id)
          );

          forkJoin(deleteRequests).subscribe(() => {
            this.confirmation.success('Staff deleted!', 'Success!');
            this.selectedStaffRows = [];
            this.loadStaffList();
          });
        }
      });
  }

  viewStaffDetail() {
    const id = this.selectedStaffRows[0]?.id;
    if (!id) return;
    this.staffService.get(id).subscribe(staff => {
      this.staffDetail = staff;
      this.isStaffDetailModalOpen = true;
    });
  }

  // ========== COMMON ==========
  handleAbpError(error: any) {
    const message =
      error?.error?.error?.message || error?.error?.message || error?.message || 'Unexpected error';
    this.toaster.error(message);
  }
}
