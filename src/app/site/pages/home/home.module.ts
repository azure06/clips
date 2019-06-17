import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// tslint:disable-next-line: no-submodule-imports
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';
import { ShareButtonModule } from '@ngx-share/button';
import { AngularMaterialModule } from '../../components/angular-material/angular-material.module';
import { FooterComponentModule } from '../../components/footer/footer.module';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AngularMaterialModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    HttpClientModule, // (Required) For share counts
    ShareButtonModule,
    FooterComponentModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
