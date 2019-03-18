import { Injectable } from '@angular/core';
import { OAuth2Client } from 'google-auth-library';
import { UserInfo } from '../../models/models';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleOAuth2Service {
  private _isAuthenticated: boolean;
  private _userInfo: Partial<UserInfo>;

  public get isAuthenticated() {
    return this._isAuthenticated;
  }

  public get userInfo() {
    return this._userInfo;
  }

  constructor(private electronService: ElectronService) {
    this.initUserInfo();
    this.initTokenHandler();
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
        this._isAuthenticated = !revoked;
        localStorage.removeItem('auth-tokens');
      }
      resolve(revoked);
    });
  }
}
