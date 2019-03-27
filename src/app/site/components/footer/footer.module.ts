import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { FooterComponent } from './footer.component';

@NgModule({
  declarations: [FooterComponent],
  imports: [AngularMaterialModule, IonicModule, CommonModule, FormsModule],
  exports: [FooterComponent],
  providers: [],
  bootstrap: []
})
export class FooterComponentModule {}
