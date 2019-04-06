import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { QuillCardComponentModule } from '../../components/quill-card/quill-card.module';
import { EditorPage } from './editor.page';

@NgModule({
  declarations: [EditorPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    QuillCardComponentModule,
    RouterModule.forChild([{ path: '', component: EditorPage }])
  ],
  exports: [],
  providers: [],
  bootstrap: []
})
export class EditorPageModule {}
