import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ClipboardImagesPage } from './clipboard-images.page';

const routes: Routes = [
  {
    path: '',
    component: ClipboardImagesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ClipboardImagesPage]
})
export class ClipboardImagesPageModule {}
