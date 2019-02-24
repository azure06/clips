import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SanitizeHtmlPipeModule } from '../../pipes/escape.pipe.ts/escape.module';
import { ClipboardItemComponent } from './clipboard-item.component';

@NgModule({
  declarations: [ClipboardItemComponent],
  imports: [IonicModule, CommonModule, FormsModule, SanitizeHtmlPipeModule],
  exports: [ClipboardItemComponent],
  providers: [],
  bootstrap: []
})
export class ClipboardItemComponentModule {}
