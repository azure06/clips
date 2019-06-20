import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FocusOnDirective } from '../../directives/focus-on/focus-on.directive';
import { SanitizeHtmlPipeModule } from '../../pipes/sanitize-html/sanitize-html.module';
import { ClipboardItemComponent } from './clipboard-item.component';

@NgModule({
  declarations: [ClipboardItemComponent, FocusOnDirective],
  imports: [IonicModule, CommonModule, FormsModule, SanitizeHtmlPipeModule],
  exports: [ClipboardItemComponent],
  providers: [],
  bootstrap: []
})
export class ClipboardItemComponentModule {}
