import { BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import { OAuth2Client } from 'google-auth-library';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { google } from 'googleapis';
import { stringify } from 'querystring';
import * as url from 'url';
import { Subject } from 'rxjs';

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
export class GoogleOAuth2Service extends EventEmitter {
  private credentials: Credentials = {};
  private oauth2Client: OAuth2Client;
  private scopes: string[] = ['profile', 'email'];
  private credentialSubject = new Subject<Credentials>();

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
    redirectUri = 'urn:ietf:wg:oauth:2.0:oob',
  }: {
    clientId: string;
    clientSecret: string;
    scopes: string[];
    redirectUri?: string;
  }) {
    super();
    this.scopes = [...new Set([...this.scopes, ...scopes])];
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Access tokens expire. This library will automatically use a refresh token to obtain a new access token if it is about to expire.
    // An easy way to make sure you always store the most recent tokens is to use the tokens event:
    this.oauth2Client.on('tokens', (tokens) => this.setCredentials(tokens));
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

  public credentialsAsObservable() {
    return this.credentialSubject.asObservable();
  }

  /**
   * Set Google Credentials
   * An easy way to make sure you always store the most recent tokens is to use the tokens event:
   *
   * @param {Credentials} tokens
   */
  public setCredentials(tokens: Credentials) {
    this.credentials = { ...this.credentials, ...tokens };
    this.oauth2Client.setCredentials(this.credentials);
    this.credentialSubject.next(this.credentials);
  }

  /**
   * Get Google tokens for given scopes
   * @param {boolean} addSession
   * @returns {Promise<Credentials>}
   */
  public async openAuthWindowAndSetCredentials(addSession?: boolean) {
    const authorizationCode = await this.getAuthorizationCode(!!addSession);
    const { tokens } = await this.oauth2Client.getToken(authorizationCode);
    this.setCredentials(tokens);
  }

  /**
   * Get authorization code for underlying authUrl
   * @param {boolean} addSession
   * @returns {Promise<string>}
   */
  private getAuthorizationCode(addSession: boolean) {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
      scope: this.scopes,
    });
    return this.openAuthWindowAndGetAuthorizationCode(
      addSession
        ? `https://accounts.google.com/AddSession?${stringify({
            continue: authUrl,
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
      const browserWindow = new BrowserWindow({
        useContentSize: true,
        fullscreen: false,
      });

      browserWindow.loadURL(urlParam);

      browserWindow.on('closed', () => {
        reject(new Error('User closed the window'));
      });

      function closeWin() {
        browserWindow.removeAllListeners('closed');
        setImmediate(() => {
          browserWindow.close();
        });
      }

      browserWindow.webContents.on('did-navigate', (_event, newUrl) => {
        const parsed = url.parse(newUrl, true);
        if (parsed.query.error) {
          reject(new Error(parsed.query.error_description as string));
          closeWin();
        } else if (parsed.query.code) {
          resolve(parsed.query.code as string);
          closeWin();
        }
      });

      browserWindow.on('page-title-updated', () => {
        setImmediate(() => {
          const title = browserWindow.getTitle();
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
