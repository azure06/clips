import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { ElectronService } from '../../services/electron/electron.service';
import * as fromClips from '../clipboard/store/index';
@Component({
  selector: 'app-clipboard',
  templateUrl: './clipboard.page.html',
  styleUrls: ['./clipboard.page.scss']
})
export class ClipboardPage {
  public isLoading = this.store.pipe(select(fromClips.isLoading));
  constructor(
    public electronService: ElectronService,
    public clipboardService: ClipboardService,
    private navCtrl: NavController,
    private store: Store<fromClips.State>,
    private router: Router
  ) {}
  navigate(url: string) {
    // FIXME ion-router doesn't trigger ngOnDestroy so we replaced it with angular router-outlet for now.
    // It requires angular Router to navigate
    this.router.navigate([url]);
  }

  navigateRoot(url: string) {
    if (url.includes('preferences') && this.electronService.isAvailable) {
      const { ipcRenderer } = this.electronService.electron;
      ipcRenderer.send('resize', { width: 800, height: 600 });
      ipcRenderer.send('center');
    }
    this.navCtrl.navigateRoot(url);
  }
}
