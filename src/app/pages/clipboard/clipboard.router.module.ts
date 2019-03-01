import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClipboardPage } from './clipboard.page';

const routes: Routes = [
  {
    path: 'clipboard',
    component: ClipboardPage,
    children: [
      {
        path: '',
        children: [
          {
            path: 'history',
            loadChildren:
              '../clipboard-history/clipboard-history.module#ClipboardHistoryPageModule'
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
        path: 'history4',
        children: [
          {
            path: '',
            loadChildren:
              '../clipboard-history/clipboard-history.module#ClipboardHistoryPageModule'
          }
        ]
      },
      {
        path: '',
        children: [
          {
            path: 'finder',
            loadChildren:
              '../clipboard-finder/clipboard-finder.module#ClipboardFinderPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/clipboard/history',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/clipboard/history',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClipboardPageRoutingModule {}
