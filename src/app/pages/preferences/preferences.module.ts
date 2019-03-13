import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AngularMaterialModule } from '../../components/angular-material/angular-material.module';
import { PreferencesPage } from './preferences.page';
import { PreferencesPageRoutingModule } from './preferences.router.module';

const routes: Routes = [
  {
    path: '',
    component: PreferencesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AngularMaterialModule,
    PreferencesPageRoutingModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PreferencesPage]
})
export class PreferencesPageModule {}
