import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QuillCardComponent } from './quill-card.component';

@NgModule({
  declarations: [QuillCardComponent],
  imports: [IonicModule, CommonModule, FormsModule],
  exports: [QuillCardComponent],
  providers: [],
  bootstrap: []
})
export class QuillCardComponentModule {}
