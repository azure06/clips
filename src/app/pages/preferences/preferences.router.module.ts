import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreferencesPage } from './preferences.page';

const routes: Routes = [
  {
    path: 'preferences',
    component: PreferencesPage,
    children: [
      {
        path: 'iam',
        children: [
          {
            path: '',
            loadChildren: '../iam/iam.module#IamPageModule'
          }
        ]
      },
      {
        path: 'system',
        children: [
          {
            path: '',
            loadChildren: '../system/system.module#SystemPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/preferences/iam',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreferencesPageRoutingModule {}
