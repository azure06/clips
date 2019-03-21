import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss']
})
export class PrivacyPolicyPage {
  constructor(public navCtrl: NavController) {}

  onActivate(event) {}

  navigate(url: string) {
    this.navCtrl.navigateRoot(url);
  }
}
