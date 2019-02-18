import { Component } from '@angular/core';

declare global {
  interface Window {
    gapi: any;
  }
}

@Component({
  selector: 'app-google-apis-page',
  templateUrl: './google-apis.page.html',
  styleUrls: ['./google-apis.page.scss']
})
export class GoogleApisPage {
  constructor() {
    setTimeout(() => {
      window.gapi.load('client', this.start);
    }, 500);
  }

  async signInWithGoogle() {}

  signOut() {}

  start() {
    // 2. Initialize the JavaScript client library.
    window.gapi.client
      .init({
        apiKey: '***REMOVED***',
        clientId:
          '380966082151-pcfn9nej8s9dqere5aocgtcpf3k1njb4.apps.googleusercontent.com',
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
        ],
        scope: 'https://www.googleapis.com/auth/drive.metadata.readonly'
      })
      .then(() => {
        console.error(window.gapi.auth2.getAuthInstance());

        window.gapi.auth2.getAuthInstance().signIn();

        window.gapi.client.drive.files
          .list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)'
          })
          .then(response => {
            const files = response.result.files;
            console.error(files);
          });
      });
  }
}
