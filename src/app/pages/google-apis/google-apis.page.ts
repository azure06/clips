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
export class GoogleApisPage {}
