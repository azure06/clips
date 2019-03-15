import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, Platform } from '@ionic/angular';
import { ClipboardService } from './services/clipboard/clipboard.service';
import { GoogleOAuth2Service } from './services/google-oauth2/google-oauth2.service';
import { GoogleTranslateService } from './services/google-translate/google-translate.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private googleTranslateService: GoogleTranslateService,
    private googleOAuth2Service: GoogleOAuth2Service,
    private clipboardService: ClipboardService,
    private navCtrl: NavController
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    this.statusBar.styleDefault();
    this.splashScreen.hide();
    this.navCtrl.navigateRoot(['clipboard/history']);
  }
}
