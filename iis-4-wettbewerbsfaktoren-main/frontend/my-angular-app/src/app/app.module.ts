import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {RouterModule, RouterOutlet} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { AppComponent } from './app.component';

import { DashboardModule } from './dashboard/dashboard.module';

import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    //AppComponent,
    //DashboardComponent,
  ],
  imports: [
    BrowserModule,
    GoogleMapsModule,
    RouterOutlet,
    DashboardModule,
    FormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
