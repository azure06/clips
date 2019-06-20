import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ClipboardPage } from './clipboard.page';
import { ClipboardPageRoutingModule } from './clipboard.router.module';
@NgModule({
  declarations: [ClipboardPage],
  imports: [
    RouterModule.forChild([{ path: '', component: ClipboardPage }]),
    IonicModule,
    CommonModule,
    FormsModule,
    ClipboardPageRoutingModule
  ],
  exports: [],
  providers: [],
  bootstrap: []
})
export class ClipboardPageModule {}
