import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ClipboardItemComponent } from './clipboard-item.component';

@NgModule({
  declarations: [ClipboardItemComponent],
  imports: [IonicModule, CommonModule, FormsModule],
  exports: [ClipboardItemComponent],
  providers: [],
  bootstrap: []
})
export class ClipboardItemComponentModule {}
