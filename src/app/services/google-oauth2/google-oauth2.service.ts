import { Injectable } from '@angular/core';
import { OAuth2Client } from 'google-auth-library';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleOAuth2Service {
  private _isAuthenticated: boolean;

  public get isAuthenticated() {
    return this._isAuthenticated;
  }

  constructor(private electronService: ElectronService) {
    this.init();
  }

  private init() {
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
