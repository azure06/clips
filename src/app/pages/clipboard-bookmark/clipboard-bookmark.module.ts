import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardItemComponentModule } from '../../components/clipboard-item/clipboard-item.module';
import { ClipboardBookmarkPage } from './clipboard-bookmark.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClipboardItemComponentModule,
    RouterModule.forChild([{ path: '', component: ClipboardBookmarkPage }])
  ],
  declarations: [ClipboardBookmarkPage]
})
export class ClipboardBookmarkPageModule {}
