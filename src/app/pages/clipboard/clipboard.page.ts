import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-clipboard',
  templateUrl: './clipboard.page.html',
  styleUrls: ['./clipboard.page.scss']
})
export class ClipboardPage {
  constructor(public router: Router, public navCtrl: NavController) {}
  navigate(url: string) {
    this.navCtrl.navigateForward(url);
  }
}
