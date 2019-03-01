import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ClipboardImageItemComponentModule } from '../../components/clipboard-image-item/clipboard-image-item.module';
import { ClipboardImagesPage } from './clipboard-images.page';

const routes: Routes = [
  {
    path: '',
    component: ClipboardImagesPage
  }
];

@NgModule({
  declarations: [ClipboardImagesPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClipboardImageItemComponentModule,
    RouterModule.forChild(routes)
  ],
  exports: [],
  providers: [],
  bootstrap: []
})
export class ClipboardImagesPageModule {}
