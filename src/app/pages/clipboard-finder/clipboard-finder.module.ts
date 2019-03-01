import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardFinderPage } from './clipboard-finder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: ClipboardFinderPage }])
  ],
  declarations: [ClipboardFinderPage]
})
export class ClipboardFinderPageModule {}
