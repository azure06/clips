import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GoogleApisPage } from './pages/google-apis/google-apis.page';

const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: './pages/clipboard/clipboard.module#ClipboardPageModule'
  // },
  {
    path: '',
    component: GoogleApisPage
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
