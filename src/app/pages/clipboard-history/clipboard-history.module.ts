import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ClipboardItemComponentModule } from './../../components/clipboard-item/clipboard-item.module';
import { ClipboardServiceModule } from './../../services/clipboard/clipboard.module';
import { ClipboardHistoryPage } from './clipboard-history.page';

@NgModule({
  declarations: [ClipboardHistoryPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ClipboardItemComponentModule,
    RouterModule.forChild([{ path: '', component: ClipboardHistoryPage }]),
    ClipboardServiceModule
  ],
  exports: [ClipboardHistoryPage],
  providers: [],
  bootstrap: []
})
export class ClipboardHistoryPageModule {}
