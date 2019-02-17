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
    window.gapi.load('client', this.start);
  }
  start() {
    // 2. Initialize the JavaScript client library.
    console.error(window.gapi);

    window.gapi.client
      .init({
        apiKey: '***REMOVED***',
        clientId:
          '1044588443711-tcgn9i57jfadlmojc3vhsg5c99g9qjdo.apps.googleusercontent.com',
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"'
        ],
        scope: 'https://www.googleapis.com/auth/drive.metadata.readonly'
      })
      .then(function() {
        // gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      });
  }
}
