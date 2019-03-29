import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, Platform } from '@ionic/angular';
import { ClipboardService } from './services/clipboard/clipboard.service';
import { ElectronService } from './services/electron/electron.service';
import { GoogleAnalyticsService } from './services/google-analytics/google-analytics.service';
import { GoogleOAuth2Service } from './services/google-oauth2/google-oauth2.service';
import { GoogleTranslateService } from './services/google-translate/google-translate.service';
import { PreferencesService } from './services/preferences/preferences.service';

// tslint:disable-next-line: no-namespace
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private electronService: ElectronService,
    private preferencesService: PreferencesService,
    private googleOAuth2Service: GoogleOAuth2Service
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    this.statusBar.styleDefault();
    this.splashScreen.hide();

    if (this.electronService.isAvailable) {
      this.navCtrl.navigateRoot('clipboard/history', { replaceUrl: true });
    }
  }
}
