import { Component } from '@angular/core';
import { GoogleOAuth2Service } from '../../services/google-oauth2/google-oauth2.service';

@Component({
  selector: 'app-iam',
  templateUrl: './iam.page.html',
  styleUrls: ['./iam.page.scss']
})
export class IamPage {
  constructor(private googleOAuth2Service: GoogleOAuth2Service) {}

  ionViewWillEnter() {}

  public async signIn() {
    this.googleOAuth2Service.signIn();
  }

  public async signOut() {
    this.googleOAuth2Service.signOut();
  }
}
