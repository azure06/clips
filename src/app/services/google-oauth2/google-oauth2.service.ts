import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleOAuth2Service {
  private ipcRenderer?: IpcRenderer;
  private oAuth2Client?: OAuth2Client;

  get isAuthenticated() {
    return !!this.oAuth2Client;
  }

  constructor() {
    if ((window as any).require) {
      this.ipcRenderer = (window as any).require('electron').ipcRenderer;

      this.ipcRenderer.send(
        'oauth2tokens',
        JSON.parse(localStorage.getItem('cloud-clips-tokens') || null)
      );
      this.ipcRenderer.send('client-load');

      this.ipcRenderer.on('oauth2tokens-refresh', (event, authTokens) =>
        localStorage.setItem('cloud-clips-tokens', JSON.stringify(authTokens))
      );
      this.ipcRenderer.on('oauth2-client', (event, oAuth2Client) => {
        console.error('here 2');
        this.oAuth2Client = oAuth2Client;
      });
    } else {
      console.warn('Could not load electron ipc');
    }
  }

  public getOAuth2Client() {
    return this.oAuth2Client;
  }
}
