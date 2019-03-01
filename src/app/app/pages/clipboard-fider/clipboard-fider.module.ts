import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ClipboardFiderPage } from './clipboard-fider.page';

const routes: Routes = [
  {
    path: '',
    component: ClipboardFiderPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ClipboardFiderPage]
})
export class ClipboardFiderPageModule {}
