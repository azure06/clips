import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RouterGuard } from './guards/router.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren:
      './site/pages/navigation/navigation.module#NavigationPageModule'
  },
  {
    path: '',
    loadChildren: './pages/clipboard/clipboard.module#ClipboardPageModule',
    canActivate: [RouterGuard]
  },
  {
    path: '',
    loadChildren:
      './pages/preferences/preferences.module#PreferencesPageModule',
    canActivate: [RouterGuard]
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
