import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule, // Hinzufügen für *ngFor und *ngIf
    FormsModule   // Hinzufügen für [(ngModel)]
  ]
})
export class DashboardModule {}
