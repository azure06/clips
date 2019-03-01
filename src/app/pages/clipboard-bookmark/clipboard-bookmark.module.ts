import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
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
