import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffService, StaffDto } from '@proxy/staffs';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-staff',
  standalone: false,
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss',
  providers: [ListService],
})
export class StaffComponent implements OnInit {
  staff = { items: [], totalCount: 0 } as PagedResultDto<StaffDto>;

  form: FormGroup;

  selectedRows: StaffDto[] = [];
  selectedStaff = {} as StaffDto;
  detailStaff = {} as StaffDto;
  isModalOpen = false;
  isDetailModalOpen = false;

  constructor(
    public readonly list: ListService,
    private staffService: StaffService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService
  ) {}

  ngOnInit() {
    const staffStreamCreator = query => this.staffService.getList(query);

    this.list.hookToQuery(staffStreamCreator).subscribe(response => {
      this.staff = response;
    });
  }

  createStaff() {
    this.selectedStaff = {} as StaffDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  editStaff() {
    const id = this.selectedRows[0]?.id;
    if (!id) return;

    this.staffService.get(id).subscribe(staff => {
      this.selectedStaff = staff;
      this.buildForm();
      this.form.patchValue(staff);
      this.isModalOpen = true;
    });
  }

  buildForm() {
    const StaffConsts = {
      MaxCodeLength: 10,
      MaxNameLength: 50,
      MaxMobileLength: 15,
      MaxEmailLength: 100,
      MaxAddressLength: 255,
      MaxBankAccountNameLength: 100,
      MaxBankAccountNoLength: 20,
      MaxBankNameLength: 100,
      MaxBankAddressLength: 255,
    };

    this.form = this.fb.group({
      organizationId: [null, Validators.required],
      managerId: [null], // không required
      code: ['', [Validators.required, Validators.maxLength(StaffConsts.MaxCodeLength)]],
      name: ['', [Validators.required, Validators.maxLength(StaffConsts.MaxNameLength)]],
      mobile: ['', [Validators.required, Validators.maxLength(StaffConsts.MaxMobileLength)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(StaffConsts.MaxEmailLength)],
      ],
      address: ['', [Validators.required, Validators.maxLength(StaffConsts.MaxAddressLength)]],
      bankAccountName: [
        '',
        [Validators.required, Validators.maxLength(StaffConsts.MaxBankAccountNameLength)],
      ],
      bankAccountNo: [
        '',
        [Validators.required, Validators.maxLength(StaffConsts.MaxBankAccountNoLength)],
      ],
      bankName: ['', [Validators.required, Validators.maxLength(StaffConsts.MaxBankNameLength)]],
      bankAddress: [
        '',
        [Validators.required, Validators.maxLength(StaffConsts.MaxBankAddressLength)],
      ],
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    if (this.selectedStaff?.id) {
      this.confirmation
        .info('Are you sure you want to update this item?', 'Are you sure?')
        .subscribe(status => {
          if (status === Confirmation.Status.confirm) {
            this.staffService.update(this.selectedStaff.id, this.form.value).subscribe(() => {
              this.isModalOpen = false;
              this.form.reset();
              this.selectedRows = [];
              this.list.get();
            });
          }
        });
    } else {
      this.staffService.create(this.form.value).subscribe(() => {
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
        this.staffService.delete(row.id)
      );

      forkJoin(deleteRequests).subscribe(() => {
        this.confirmation.success('Staff deleted!', 'Success!');
        this.selectedRows = [];
        this.list.get();
      })
    }
    });
  }

  view(){
    const id = this.selectedRows[0]?.id;
    if (!id) return;

    this.staffService.get(id).subscribe((staff) => {
      this.detailStaff = staff;
      this.isDetailModalOpen = true;
    });
  }
}
