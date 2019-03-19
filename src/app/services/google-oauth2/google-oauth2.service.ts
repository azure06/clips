import { Injectable } from '@angular/core';
import { UserInfo } from '../../models/models';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleOAuth2Service {
  private _isAuthenticated: boolean;
  private _userInfo: Partial<UserInfo>;
  private _driveSync: boolean;

  public get isAuthenticated() {
    return this._isAuthenticated;
  }

  public get userInfo() {
    return this._userInfo;
  }

  public get driveSync() {
    return this._driveSync;
  }

  public set driveSync(driveSync) {
    localStorage.setItem('drive-sync', JSON.stringify(driveSync));
    this._driveSync = driveSync;
    this.electronService.send('drive-sync', driveSync);
  }

  constructor(private electronService: ElectronService) {
    this.initUserInfo();
    this.initTokenHandler();
    this.initGoogleDrive();
  }

  private initUserInfo() {
    this._userInfo =
      JSON.parse(localStorage.getItem('user-info') || null) || {};
    const onUserInfo = (event, userInfo: UserInfo) => {
      this._userInfo = userInfo;
      localStorage.setItem('user-info', JSON.stringify(userInfo));
    };
    this.electronService.on('user-info', onUserInfo);
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

    this.electronService.send('client-ready', oauth2Tokens);
    this.electronService.on('oauth2tokens-refresh', onTokensRefresh);
  }

  public async signIn(): Promise<boolean> {
    return new Promise(async resolve => {
      this.electronService.send('sign-in');
      const authenticated = (await this.electronService.once('sign-in-result'))
        .data;
      this._isAuthenticated = authenticated;
      resolve(authenticated);
    });
  }

  public async signOut(): Promise<boolean> {
    return new Promise(async resolve => {
      this.electronService.send('sign-out');
      const revoked = (await this.electronService.once('sign-out-result')).data;
      if (revoked) {
        this._isAuthenticated = false;
        this.driveSync = false;
        localStorage.removeItem('auth-tokens');
      }
      resolve(revoked);
    });
  }

  public initGoogleDrive() {
    const driveSync =
      JSON.parse(localStorage.getItem('drive-sync') || null) || false;
    this.driveSync = driveSync;
  }

  public async syncWithGoogleDrive() {
    return new Promise(async resolve => {
      this.electronService.send('sign-out');
      const revoked = (await this.electronService.once('sign-out-result')).data;
      if (revoked) {
        this._isAuthenticated = !revoked;
        localStorage.removeItem('auth-tokens');
      }
      resolve(revoked);
    });
  }
}
