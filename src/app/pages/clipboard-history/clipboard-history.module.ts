import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ClipboardHistoryPage } from './clipboard-history.page';

@NgModule({
  declarations: [ClipboardHistoryPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ClipboardHistoryPage }])
  ],
  exports: [ClipboardHistoryPage],
  providers: [],
  bootstrap: []
})
export class ClipboardHistoryPageModule {}
