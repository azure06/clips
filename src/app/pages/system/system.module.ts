import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PreferencesServiceModule } from '../../services/preferences/preferences.module';
import { SystemPage } from './system.page';

const routes: Routes = [
  {
    path: '',
    component: SystemPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreferencesServiceModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SystemPage]
})
export class SystemPageModule {}
