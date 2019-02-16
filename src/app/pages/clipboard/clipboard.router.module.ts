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
        path: '',
        children: [
          {
            path: 'searcher',
            loadChildren:
              '../clipboard-searcher/clipboard-searcher.module#ClipboardSearcherPageModule'
          }
        ]
      },
      {
        path: 'history3',
        children: [
          {
            path: '',
            loadChildren:
              '../clipboard-history/clipboard-history.module#ClipboardHistoryPageModule'
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
