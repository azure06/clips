import { Injectable } from '@angular/core';
import { OAuth2Client } from 'google-auth-library';
import { ElectronService } from '../electron/electron.service';

@Injectable()
export class GoogleOAuth2Service {
  private ipcRenderer = this.electronService.electron.ipcRenderer;
  private _isAuthenticated: boolean;

  public get isAuthenticated() {
    return this._isAuthenticated;
  }

  constructor(private electronService: ElectronService) {
    this.init();
  }

  private init() {
    const oauth2Tokens = JSON.parse(
      localStorage.getItem('infiniti-auth-tokens') || null
    );
    const onTokensRefresh = (event, authTokens) => {
      const localTokens =
        JSON.parse(localStorage.getItem('infiniti-clips-tokens') || null) || {};

      this._isAuthenticated = !!localTokens;

      localStorage.setItem(
        'infiniti-auth-tokens',
        JSON.stringify({ ...localTokens, ...authTokens })
      );
    };
    this.ipcRenderer.send('client-ready', oauth2Tokens);
    this.ipcRenderer.on('oauth2tokens-refresh', onTokensRefresh);
  }

  public async signIn(): Promise<boolean> {
    return new Promise(resolve => {
      this.ipcRenderer.send('sign-in');
      this.ipcRenderer.once('sign-in-result', (event, authenticated) => {
        this._isAuthenticated = authenticated;
        resolve(authenticated);
      });
    });
  }

  public async signOut(): Promise<boolean> {
    return new Promise(resolve => {
      this.ipcRenderer.send('sign-out');
      this.ipcRenderer.once('sign-out-result', (event, revoked) => {
        if (revoked) {
          this._isAuthenticated = !revoked;
          localStorage.removeItem('infiniti-auth-tokens');
        }
        resolve(revoked);
      });
    });
  }
}
