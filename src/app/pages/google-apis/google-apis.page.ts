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
  }
}
