import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClipboardImageItemComponent } from './clipboard-image-item.component';

@NgModule({
  declarations: [ClipboardImageItemComponent],
  imports: [IonicModule, CommonModule, FormsModule],
  exports: [ClipboardImageItemComponent],
  providers: [],
  bootstrap: []
})
export class ClipboardImageItemComponentModule {}
