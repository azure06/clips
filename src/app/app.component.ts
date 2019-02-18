import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';

declare global {
  interface Window {
    require: any;
  }
}
/* from app code, require('electron').remote calls back to main process */
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    ipcRenderer.on('oauth-token', (event, token) => {
      console.error(token);
    });
  }
}
