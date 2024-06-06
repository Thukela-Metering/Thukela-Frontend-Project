
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BuildingService } from 'src/app/services/building.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAccordion } from '@angular/material/expansion';
import { BuildingAccountDTO, BuildingDTO, BuildingOwnerDTO, OperationalResultDTO, PersonDTO, TransactionDTO, UserDataDTO } from 'src/app/DTOs/dtoIndex';
import { PortfolioService } from 'src/app/services/portfolio.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
})
export class PortfolioComponent implements OnInit {
  portfolioForm: FormGroup;
  buildings: BuildingDTO[] = [];
  selectedBuilding: BuildingDTO;
  selectedBuildingAccount: BuildingAccountDTO;
  selectedOwnerAccount:BuildingOwnerDTO;
  selectedPerson: UserDataDTO;
  transactionData: TransactionDTO;

  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private portfolioService:PortfolioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.portfolioForm = this.fb.group({
      building: ['']
    });

    this.loadBuildings();
  }

  loadBuildings(): void {
    this.buildingService.getAllBuildings(true).subscribe({
      next: (response) => {
        this.buildings = response.data?.buildingDTOs ?? [];
      },
      error: (error) => {
        this.snackBar.open('Error loading buildings', 'Close', { duration: 3000 });
        console.error('Error loading buildings:', error);
      }
    });
  }

  onBuildingChange(buildingId: number): void {
    this.portfolioService.getPortfolioBuildingById(buildingId).subscribe({
      next: (response: OperationalResultDTO<TransactionDTO>) => {
        if (response.success) {
        console.log(response);
          this.transactionData = response.data!;
          this.selectedBuilding = this.transactionData!.buildingDTOs![0];
          this.selectedBuildingAccount = this.transactionData!.buildingAccountDTOs![0];
          this.selectedOwnerAccount = this.transactionData!.buildingOwnerAccountDTOs![0];
          this.selectedPerson =this.transactionData!.userDataDTOs![0];
        } else {
          this.snackBar.open('Failed to load building data', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.transactionData = new TransactionDTO()
        this.snackBar.open('Error loading building data', 'Close', { duration: 3000 });
        console.error('Error loading building data:', error);
      }
    });
  }
  togglePanels(isExpanded: boolean): void {
    if (isExpanded) {
      this.accordion.openAll();
    } else {
      this.accordion.closeAll();
    }
  }
}
