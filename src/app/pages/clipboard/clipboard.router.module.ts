import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClipboardPage } from './clipboard.page';

const routes: Routes = [
  {
    path: 'clipboard',
    component: ClipboardPage,
    children: [
      {
        path: 'history',
        children: [
          {
            path: '',
            loadChildren:
              '../clipboard-history/clipboard-history.module#ClipboardHistoryPageModule'
          }
        ]
      },
      {
        path: 'images',
        children: [
          {
            path: '',
            loadChildren:
              '../clipboard-images/clipboard-images.module#ClipboardImagesPageModule'
          }
        ]
      },
      {
        path: 'bookmark',
        children: [
          {
            path: '',
            loadChildren:
              '../clipboard-bookmark/clipboard-bookmark.module#ClipboardBookmarkPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/clipboard/history',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClipboardPageRoutingModule {}
