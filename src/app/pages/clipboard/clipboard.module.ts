import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
  MatTabsModule,
  MatToolbarModule
} from '@angular/material';
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
    ClipboardPageRoutingModule,
    MatTabsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: []
})
export class ClipboardPageModule {}
