import { Injectable } from '@angular/core';
import { UserInfo } from '../../models/models';
import { ElectronService } from '../electron/electron.service';
import { GoogleAnalyticsService } from '../google-analytics/google-analytics.service';

@Injectable()
export class GoogleOAuth2Service {
  private _isAuthenticated: boolean;
  private _userInfo: UserInfo | null;
  private _driveSync: boolean;

  public get isAuthenticated() {
    return this._isAuthenticated;
  }

  public get userInfo() {
    return this._userInfo;
  }

  public set userInfo(userInfo) {
    // Set Google Analytics Uid Service
    this._userInfo = userInfo;
    if (userInfo) {
      localStorage.setItem('user-info', JSON.stringify(userInfo));
      this.googleAnalyticsService.setUserId(userInfo.permissionId);
    }
  }

  public get driveSync() {
    return this._driveSync;
  }

  public set driveSync(driveSync: boolean) {
    this.es.ipcRenderer.send('drive-sync', driveSync);
    this.es.ipcRenderer
      .once('drive-sync-result')
      .then(({ data }) => {
        localStorage.setItem('drive-sync', JSON.stringify(driveSync));
        this._driveSync = driveSync;
      })
      .catch(error => (this._driveSync = false));
  }

  constructor(
    private es: ElectronService,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
    this.initUserInfo();
    this.initTokenHandler();
    this.initGoogleDrive();
  }

  private initUserInfo() {
    this.userInfo = JSON.parse(localStorage.getItem('user-info') || null);
    const onUserInfo = (event, userInfo: UserInfo) =>
      (this.userInfo = userInfo);
    this.es.ipcRenderer.on('user-info', onUserInfo);
  }

  private initTokenHandler() {
    const oauth2Tokens = JSON.parse(
      localStorage.getItem('auth-tokens') || null
    );

    this._isAuthenticated = !!oauth2Tokens;

    const onTokensRefresh = (event, authTokens) => {
      const localTokens =
        JSON.parse(localStorage.getItem('auth-tokens') || null) || {};

      localStorage.setItem(
        'auth-tokens',
        JSON.stringify({ ...localTokens, ...authTokens })
      );
    };

    this.es.ipcRenderer.send('client-ready', oauth2Tokens);
    this.es.ipcRenderer.on('oauth2tokens-refresh', onTokensRefresh);
  }

  public initGoogleDrive() {
    const driveSync =
      JSON.parse(localStorage.getItem('drive-sync') || null) || false;
    this.driveSync = driveSync;
  }

  public async signIn() {
    this.es.ipcRenderer.send('sign-in');
    return this.es.ipcRenderer
      .once('sign-in-result')
      .then(() => (this._isAuthenticated = true))
      .catch(error => console.error('Sign-in error ', error));
  }

  public async signOut() {
    this.driveSync = false;
    this.es.ipcRenderer.send('sign-out');
    // return this.electronService
    //   .once('sign-out-result')
    //   .catch(error => console.error('Sign-out error ', error))
    Promise.resolve().finally(() => {
      localStorage.removeItem('auth-tokens');
      this._isAuthenticated = false;
    });
  }
}
