import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AngularMaterialModule } from '../../components/angular-material/angular-material.module';
import { NavigationPage } from './navigation.page';
import { NavigationPageRoutingModule } from './navigation.router.module';

@NgModule({
  declarations: [NavigationPage],
  imports: [
    RouterModule.forChild([{ path: '', component: NavigationPage }]),
    IonicModule,
    CommonModule,
    FormsModule,
    AngularMaterialModule,
    NavigationPageRoutingModule
  ],
  exports: [],
  providers: [],
  bootstrap: []
})
export class NavigationPageModule {}
