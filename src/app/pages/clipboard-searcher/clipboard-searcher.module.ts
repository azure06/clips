import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ClipboardSearcherPage } from './clipboard-searcher.page';

@NgModule({
  declarations: [ClipboardSearcherPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ClipboardSearcherPage }])
  ],
  exports: [ClipboardSearcherPage],
  providers: [],
  bootstrap: []
})
export class ClipboardSearcherPageModule {}
