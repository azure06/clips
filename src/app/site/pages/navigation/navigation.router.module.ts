import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavigationPage } from './navigation.page';

const routes: Routes = [
  {
    path: '',
    component: NavigationPage,
    children: [
      {
        path: '',
        children: [
          {
            path: '',
            loadChildren: '../home/home.module#HomePageModule'
          }
        ]
      },
      {
        path: 'features',
        children: [
          {
            path: '',
            loadChildren: '../features/features.module#FeaturesPageModule'
          }
        ]
      },
      {
        path: 'contact',
        children: [
          {
            path: '',
            loadChildren: '../contact/contact.module#ContactPageModule'
          }
        ]
      },
      {
        path: 'privacy',
        children: [
          {
            path: '',
            loadChildren:
              '../privacy-policy/privacy-policy.module#PrivacyPolicyPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/features',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationPageRoutingModule {}
