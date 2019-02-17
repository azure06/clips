import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GoogleApisPage } from './google-apis.page';

@NgModule({
  declarations: [GoogleApisPage],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: GoogleApisPage }])
  ],
  exports: [],
  providers: [],
  bootstrap: []
})
export class GoogleApisPageModule {}
