import { BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import { OAuth2Client } from 'google-auth-library';
// tslint:disable-next-line: no-submodule-imports
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { google } from 'googleapis';
import { stringify } from 'querystring';
import * as url from 'url';

/**
 * Tokens updated event
 *
 * @event GoogleOAuth2#tokens
 * @type {Credentials}
 */

/**
 * Handle Google Auth processes through Electron.
 * This class automatically renews expired tokens.
 * @fires GoogleOAuth2#tokens
 */
export default class GoogleOAuth2Service extends EventEmitter {
  private oauth2Client: OAuth2Client;
  private scopes: string[] = ['profile', 'email'];

  /**
   * Create a new instance of ElectronGoogleOAuth2
   * Google Client ID
   * Google Client Secret
   * Google scopes - 'profile' and 'email' will always be present
   * redirectUri - defaults to 'urn:ietf:wg:oauth:2.0:oob'
   * @param {object} clientInfo - Consist of Google Client ID, Google Client Secret, Coogle scopes, and redirectUri which is optional
   */
  constructor({
    clientId,
    clientSecret,
    scopes,
    redirectUri = 'urn:ietf:wg:oauth:2.0:oob'
  }: {
    clientId: string;
    clientSecret: string;
    scopes: string[];
    redirectUri?: string;
  }) {
    super();
    this.scopes = [...new Set([...this.scopes, ...scopes])];
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Access tokens expire. This library will automatically use a refresh token to obtain a new access token if it is about to expire.
    // An easy way to make sure you always store the most recent tokens is to use the tokens event:
    this.oauth2Client.on('tokens', tokens => this.setCredentials(tokens));
  }

  /**
   * Get google OAuth2 Client instance
   *
   */
  public getOAuth2Client() {
    return this.oauth2Client;
  }

  /**
   * Revoke all credentials
   *
   */
  public revokeCredentials() {
    return this.oauth2Client.revokeCredentials();
  }

  /**
   * Set Google Credentials
   * An easy way to make sure you always store the most recent tokens is to use the tokens event:
   *
   * @param {Credentials} tokens
   */
  public setCredentials(tokens: Credentials) {
    this.oauth2Client.setCredentials(tokens);
    this.emit('tokens', tokens);
  }

  /**
   * Get Google tokens for given scopes
   * @param {boolean} addSession
   * @returns {Promise<Credentials>}
   */
  public async openAuthWindowAndSetCredentials(addSession?: boolean) {
    try {
      const authorizationCode = await this.getAuthorizationCode(addSession);
      const { tokens } = await this.oauth2Client.getToken(authorizationCode);
      this.setCredentials(tokens);
      return true;
    } catch (error) {
      console.error('Sign-in error: ', error);
      return false;
    }
  }

  /**
   * Get authorization code for underlying authUrl
   * @param {boolean} addSession
   * @returns {Promise<string>}
   */
  private getAuthorizationCode(addSession: boolean) {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
      scope: this.scopes
    });
    return this.openAuthWindowAndGetAuthorizationCode(
      addSession
        ? `https://accounts.google.com/AddSession?${stringify({
            continue: authUrl
          })}`
        : authUrl
    );
  }

  /**
   * Get authorization code for given url
   * @param {string} urlParam
   * @returns {Promise<string>}
   */
  private openAuthWindowAndGetAuthorizationCode(urlParam: string) {
    return new Promise<string>((resolve, reject) => {
      const win = new BrowserWindow({
        useContentSize: true,
        fullscreen: false
      });

      win.loadURL(urlParam);

      win.on('closed', () => {
        reject(new Error('User closed the window'));
      });

      function closeWin() {
        win.removeAllListeners('closed');
        setImmediate(() => {
          win.close();
        });
      }

      win.webContents.on('did-navigate', (_event, newUrl) => {
        const parsed = url.parse(newUrl, true);
        if (parsed.query.error) {
          reject(new Error(parsed.query.error_description as string));
          closeWin();
        } else if (parsed.query.code) {
          resolve(parsed.query.code as string);
          closeWin();
        }
      });

      win.on('page-title-updated', () => {
        setImmediate(() => {
          const title = win.getTitle();
          if (title.startsWith('Denied')) {
            reject(new Error(title.split(/[ =]/)[2]));
            closeWin();
          } else if (title.startsWith('Success')) {
            resolve(title.split(/[ =]/)[2]);
            closeWin();
          }
        });
      });
    });
  }
}
