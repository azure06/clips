import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: './pages/clipboard/clipboard.module#ClipboardPageModule'
  },  { path: 'clipboard-images', loadChildren: './pages/clipboard-images/clipboard-images.module#ClipboardImagesPageModule' }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
