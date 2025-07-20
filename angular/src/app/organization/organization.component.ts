import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationUnitService, OrganizationUnitDto, OrganizationUnitTreeDto } from '@proxy/organization-units';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';
import { forkJoin, Observable } from 'rxjs';
import { ToasterService } from '@abp/ng.theme.shared';
import { LocalizationService } from '@abp/ng.core';
import * as signalR from '@microsoft/signalr';
import { StaffDto, StaffService, StaffSimpleDto } from '@proxy/staffs';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-organization',
  standalone: false,
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
  // providers: [ListService],
})

export class OrganizationComponent implements OnInit {
  // ========== ORGANIZATION UNIT ==========
  organizationTree: TreeNode[] = [];
  selectedOrganizationNode: OrganizationUnitDto | null = null;
  isModalOpen = false;
  isEditMode = false;
  ouForm: FormGroup;
  expandedNodeIds = new Set<string>();

  // ========== STAFF ==========
  staff = { items: [], totalCount: 0 } as PagedResultDto<StaffDto>;
  selectedStaffRows: StaffDto[] = [];
  managers: StaffSimpleDto[] = [];
  staffForm: FormGroup;
  staffDetail = {} as StaffDto;
  isStaffModalOpen = false;
  isStaffDetailModalOpen = false;

  staffQuery = {
    skipCount: 0,
    maxResultCount: 10,
    sorting: 'name',
  };

  constructor(
    private organizationUnitService: OrganizationUnitService,
    private staffService: StaffService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private toaster: ToasterService
  ) {}

  ngOnInit() {
    this.buildOuForm();
    this.buildStaffForm();
    this.loadOrganizationTree();
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

  // ========== ORGANIZATION UNIT CRUD ==========

  convertToTreeNode(input: OrganizationUnitTreeDto[]): TreeNode[] {
  return input.map(unit => ({
    key: unit.id,
    label: unit.displayName,
    data: unit,
    expanded: this.expandedNodeIds.has(unit.id),
    children: this.convertToTreeNode(unit.children || []),
  }));
}

onNodeExpand(event: { node: TreeNode }) {
  const nodeId = event.node?.key;
  if (nodeId) {
    this.expandedNodeIds.add(nodeId);
  }
}

onNodeCollapse(event: { node: TreeNode }) {
  const nodeId = event.node?.key;
  if (nodeId) {
    this.expandedNodeIds.delete(nodeId);
  }
}

  // Tải toàn bộ cây Organization Unit
  loadOrganizationTree() {
    this.organizationUnitService.getTree().subscribe(result => {
      this.organizationTree = this.convertToTreeNode(result);
    });
  }

  // Khi một node trên tree được chọn
  onNodeSelected(node: TreeNode | undefined) {
  if (!node || !node.data) return;
  this.selectedOrganizationNode = node.data;
  this.staffQuery.skipCount = 0;
  this.loadStaffList();
}

  // Tạo form
  buildOuForm() {
    this.ouForm = this.fb.group({
      displayName: ['', Validators.required],
      parentId: [null],
    });
  }

  // Mở modal dể tạo Tạo OU cha
  createRootOu() {
    this.isEditMode = false;
    this.ouForm.reset({ displayName: '', parentId: null });
    this.isModalOpen = true;
  }

  // Mở modal để Tạo OU con
  createChildOu(parentNode: OrganizationUnitDto) {
    this.isEditMode = false;
    this.ouForm.reset({ displayName: '', parentId: parentNode.id }); // gán parentId cho form
    this.isModalOpen = true;
  }

  editOu(node: OrganizationUnitDto) {
    console.log('Editing node: ', node)
    this.isEditMode = true;
    this.selectedOrganizationNode = node;
    this.ouForm.reset({
      displayName: node.displayName,
      parentId: node.parentId,
    });
    this.isModalOpen = true;
  }

  saveOu() {
    if (this.ouForm.invalid) return;

    const dto = this.ouForm.value;
    console.log('Saving mode:', this.isEditMode ? 'Edit' : 'Create');
  console.log('Selected node id:', this.selectedOrganizationNode?.id);
  console.log('Form values:', dto);

    let request;

    if (this.isEditMode && this.selectedOrganizationNode?.id) {
      // only update name
      request = this.organizationUnitService.update(
        this.selectedOrganizationNode.id,
        { displayName: dto.displayName, parentId: dto.parentId }
      );
    } else {
      request = this.organizationUnitService.create(dto);
    }

    request.subscribe({
      next: () => {
        this.toaster.success('Successfully saved');
        this.isModalOpen = false;
        this.isEditMode = false;
        this.selectedOrganizationNode = null;
        this.loadOrganizationTree();
      },
      error: err => this.handleAbpError(err),
    });
  }

  deleteOu(id: string) {
    this.confirmation.warn('Delete?', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.organizationUnitService.delete(id).subscribe(() => {
          this.toaster.success('Deleted');
          this.loadOrganizationTree();
          this.selectedOrganizationNode = null;
          this.staff = { items: [], totalCount: 0 }; // Xóa danh sách staff
        });
      }
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedNodeIds.has(id);
  }

  toggleExpand(nodeId: string) {
    if (this.expandedNodeIds.has(nodeId)) {
      this.expandedNodeIds.delete(nodeId);
    } else {
      this.expandedNodeIds.add(nodeId);
    }
  }

  // ========== STAFF CRUD ==========
  onStaffPage(event: { offset: number }) {
    this.staffQuery.skipCount = event.offset * this.staffQuery.maxResultCount;
    this.loadStaffList();
  }

  loadStaffList() {
    if (this.selectedOrganizationNode?.id) {
      this.staffService
        .getListByOrganization(this.selectedOrganizationNode.id, this.staffQuery)
        .subscribe(data => {
          this.staff = data;
        });
    } else {
      this.staff = { items: [], totalCount: 0 }; // Nếu không OU nào được chọn
    }
  }

  createStaff() {
    if (!this.selectedOrganizationNode) return; // Không cho tạo nếu chưa chọn OU
    this.selectedStaffRows = [];
    this.staffForm.reset({
      organizationUnitId: this.selectedOrganizationNode.id,
    });
    this.isStaffModalOpen = true;
  }

  editStaff() {
    const staffToEdit = this.selectedStaffRows[0];
    if (!staffToEdit) return;
    this.staffForm.patchValue(staffToEdit);
    this.isStaffModalOpen = true;
  }

  buildStaffForm() {
    this.staffForm = this.fb.group({
      organizationUnitId: [null, Validators.required],
      managerId: [null],
      code: ['', Validators.required],
      name: [''],
      mobile: [''],
      email: ['', Validators.email],
      address: [''],
      bankAccountName: [''],
      bankAccountNo: [''],
      bankName: [''],
      bankAddress: [''],
    });
  }

  saveStaff() {
    if (this.staffForm.invalid) {
      return;
    }

    const staffId = this.selectedStaffRows[0]?.id;
    const staffFormValue = this.staffForm.value;

    if (staffId) {
      this.staffService.update(staffId, staffFormValue).subscribe({
        next: () => {
          this.toaster.success('Staff updated successfully');
          this.isStaffModalOpen = false;
          this.selectedStaffRows = [];
          this.loadStaffList();
        },
        error: error => {
          if (error?.error?.error?.code === 'HA_ERP:20001') {
            const message = error.error.error.message;

            this.staffForm.get('email')?.setErrors({ duplicated: true });
            this.staffForm.get('code')?.setErrors({ duplicated: true });
            this.staffForm.get('name')?.setErrors({ duplicated: true });

            this.toaster.error(message);
          } else {
            this.handleAbpError(error);
          }
        },
      });
    } else {
      this.staffService.create(staffFormValue).subscribe({
        next: () => {
          this.toaster.success('Staff created successfully');
          this.isStaffModalOpen = false;
          this.selectedStaffRows = [];
          this.loadStaffList();
        },
        error: error => {
          if (error?.error?.error?.code === 'HA_ERP:20001') {
            const message = error.error.error.message;

            this.staffForm.get('email')?.setErrors({ duplicated: true });
            this.staffForm.get('code')?.setErrors({ duplicated: true });
            this.staffForm.get('name')?.setErrors({ duplicated: true });

            this.toaster.error(message);
          } else {
            this.handleAbpError(error);
          }
        },
      });
    }
  }

  deleteStaff() {
    this.confirmation.warn('Delete selected staff?', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        const deleteRequests = this.selectedStaffRows.map(row => this.staffService.delete(row.id));
        forkJoin(deleteRequests).subscribe(() => {
          this.toaster.success('Staff deleted');
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
  handleAbpError(err: any) {
    const error = err?.error?.error;

  if (!error) {
    this.toaster.error('Unknown error');
    return;
  }

  const code = error.code || 'UNKNOWN';
  const message = error.message || 'An unexpected error occurred';

  this.toaster.error(message, code);
  }
}
