import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { ElectronService } from '../../services/electron/electron.service';
import { PreferencesService } from '../../services/preferences/preferences.service';
import * as fromClips from '../clipboard/store/index';
@Component({
  selector: 'app-clipboard',
  templateUrl: './clipboard.page.html',
  styleUrls: ['./clipboard.page.scss']
})
export class ClipboardPage {
  public generalSettings: Partial<{
    startup: boolean;
    hideTitleBar: boolean;
  }> = {};
  public isLoading = this.store.pipe(select(fromClips.isLoading));
  constructor(
    public es: ElectronService,
    public clipboardService: ClipboardService,
    public preferencesService: PreferencesService,
    public router: Router,
    private navCtrl: NavController,
    private store: Store<fromClips.State>
  ) {}

  ionViewWillEnter() {
    this.generalSettings = this.preferencesService.getAppSettings().general;
  }

  navigateForward(url: string) {
    this.navCtrl.navigateForward(url);
  }

  navigateRoot(url: string, preferences?: {}) {
    this.navCtrl.navigateRoot(url);
  }
}
