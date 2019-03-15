import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.page.html',
  styleUrls: ['./navigation.page.scss']
})
export class NavigationPage {
  constructor(public navCtrl: NavController) {}

  onActivate(event) {}

  navigate(url: string) {
    this.navCtrl.navigateRoot(url);
  }
}
