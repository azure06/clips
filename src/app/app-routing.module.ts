import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren:
      './site/pages/navigation/navigation.module#NavigationPageModule'
  },
  {
    path: '',
    loadChildren: './pages/clipboard/clipboard.module#ClipboardPageModule'
  },
  {
    path: '',
    loadChildren: './pages/preferences/preferences.module#PreferencesPageModule'
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
