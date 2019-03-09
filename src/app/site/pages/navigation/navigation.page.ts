import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.page.html',
  styleUrls: ['./navigation.page.scss']
})
export class NavigationPage {
  constructor(public router: Router, public navCtrl: NavController) {}
  navigate(url: string) {
    this.navCtrl.navigateForward(url);
  }
}
