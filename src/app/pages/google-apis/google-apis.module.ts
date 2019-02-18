import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// tslint:disable-next-line: no-submodule-imports
import { AngularFireAuthModule } from '@angular/fire/auth';
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
    AngularFireAuthModule,
    RouterModule.forChild([{ path: '', component: GoogleApisPage }])
  ],
  exports: [],
  providers: [],
  bootstrap: []
})
export class GoogleApisPageModule {}
