import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { AngularMaterialModule } from '../../components/angular-material/angular-material.module';
import { FeaturesPage } from './features.page';

const routes: Routes = [
  {
    path: '',
    component: FeaturesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AngularMaterialModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FeaturesPage]
})
export class FeaturesPageModule {}
