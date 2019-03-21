import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PrivacyPolicyPage } from './privacy-policy.page';

@NgModule({
  declarations: [PrivacyPolicyPage],
  imports: [
    RouterModule.forChild([{ path: '', component: PrivacyPolicyPage }]),
    IonicModule,
    CommonModule,
    FormsModule
  ],
  exports: [],
  providers: [],
  bootstrap: []
})
export class PrivacyPolicyPageModule {}
