import { Injectable } from '@angular/core';
import { UserInfo } from '../../models/models';
import { ElectronService } from '../electron/electron.service';
import { GoogleAnalyticsService } from '../google-analytics/google-analytics.service';
import { PreferencesService } from '../preferences/preferences.service';

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
    }
  }

  public get driveSync() {
    return this._driveSync;
  }

  public set driveSync(sync: boolean) {
    const currentDrive = this.preferencesService.getAppSettings().drive;
    const drive = { ...currentDrive, sync };
    this.es.ipcRenderer.send('drive-sync', drive);
    this.es.ipcRenderer
      .once('drive-sync-result')
      .then(({ data }) => {
        this.preferencesService.setAppSettings({ drive });
        this._driveSync = drive.sync;
      })
      .catch(error => () => {
        console.error('Sync error');
        this.preferencesService.setAppSettings({
          drive: { ...currentDrive, sync: false }
        });
        this._driveSync = false;
      });
  }

  constructor(
    private es: ElectronService,
    private preferencesService: PreferencesService,
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
    const { sync } = this.preferencesService.getAppSettings().drive;
    this.driveSync = sync;

    this.es.ipcRenderer.on('page-token', (event, { pageToken }) => {
      this.preferencesService.setAppSettings({
        drive: { sync: true, pageToken }
      });
    });
  }

  public async signIn() {
    this.es.ipcRenderer.send('sign-in');
    return this.es.ipcRenderer
      .once('sign-in-result')
      .then(() => {
        // On sign-in reset page token
        this.preferencesService.setAppSettings({
          drive: { pageToken: undefined, sync: false }
        });
        this._isAuthenticated = true;
      })
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
