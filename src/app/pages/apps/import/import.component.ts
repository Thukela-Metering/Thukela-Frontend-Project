import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { OperationalResultDTO } from 'src/app/DTOs/dtoIndex';
import { ImportService } from 'src/app/services/import.service';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
})
export class ImportComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  importForm: FormGroup;
  importTypes: { value: string; viewValue: string }[] = [
    { value: 'Buildings', viewValue: 'Buildings, Owners & Accounts' },
    { value: 'Tenants', viewValue: 'Tenants' }
  ];
  selectedFile: File | null = null;
  isLoading = false;
  dragOver = false;

  // Mapping of import types to their respective template file paths
  importTypeTemplates: { [key: string]: string } = {
    'Buildings': 'assets/Templates/Buildings Template.xltx',
    //'Tenants': 'assets/templates/import-template-tenants.xlsx', // Add path for Tenants
  };

  constructor(
    private fb: FormBuilder,
    private _importService: ImportService, // Inject the service
    private http: HttpClient, // Inject HttpClient
    private _snackBar: MatSnackBar // Inject MatSnackBar
  ) {
    this.importForm = this.fb.group({
      importType: ['', Validators.required],
      file: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0] as File;
    if (file && this.isCSVFile(file)) {
      this.selectedFile = file;
      this.importForm.patchValue({ file: file });
    } else {
      this._snackBar.open('Please select a valid CSV file.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.isCSVFile(file)) {
        this.selectedFile = file;
        this.importForm.patchValue({ file: file });
      } else {
        this._snackBar.open('Please drop a valid CSV file.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    }
  }

  clearSelectedFile(event: Event): void {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.selectedFile = null;
    this.importForm.patchValue({ file: null });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this._snackBar.open('Selected file cleared.', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-info']
    });
  }

  isCSVFile(file: File): boolean {
    return (
      file.name.endsWith('.csv') ||
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel'
    );
  }

  onSubmit(): void {
    if (this.importForm.invalid || !this.selectedFile) {
      this._snackBar.open('Please select an import type and a CSV file.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }
  
    const formData = new FormData();
    formData.append('file', this.selectedFile!);
  
    const importType = this.importForm.get('importType')?.value;
    formData.append('importType', importType);
  
    this.isLoading = true;
  
    this._importService.importData(formData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.importForm.reset();
        this.selectedFile = null;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      })
    ).subscribe({
      next: (response: OperationalResultDTO<boolean>) => {
        if (response && response.success) {
          console.log('Import successful:', response.data);
          this._snackBar.open(response.message || 'Import successful!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        } else {
          console.error('Import failed:', response.message);
          this._snackBar.open(response.message || 'Import failed.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (error: any) => {
        console.error('Error importing data:', error);
        this._snackBar.open('An error occurred during import.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  // New Method to Download Template Dynamically
  downloadTemplate(): void {
    const importType = this.importForm.get('importType')?.value;
    const templatePath = this.importTypeTemplates[importType];

    if (!importType) {
      this._snackBar.open('Please select an import type first.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    if (!templatePath) {
      this._snackBar.open('No template available for the selected import type.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = templatePath;
    
    // Extract the filename from the path
    const fileName = templatePath.substring(templatePath.lastIndexOf('/') + 1);
    link.download = fileName;

    // Append to the document to make it clickable
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Remove the anchor from the document
    document.body.removeChild(link);

    this._snackBar.open(`Template "${fileName}" downloaded successfully.`, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }
}
