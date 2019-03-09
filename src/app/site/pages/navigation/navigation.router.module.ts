import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesPage } from '../features/features.page';
import { NavigationPage } from './navigation.page';

const routes: Routes = [
  {
    path: 'navigation',
    component: NavigationPage,
    children: [
      {
        path: 'features',
        children: [
          {
            path: '',
            loadChildren: '../features/features.module#FeaturesPageModule'
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationPageRoutingModule {}
