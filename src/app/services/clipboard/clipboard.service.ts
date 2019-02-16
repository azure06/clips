import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-clipboard',
  templateUrl: './clipboard.service.html',
  styleUrls: ['./clipboard.service.scss']
})
export class ClipboardService {
  constructor(public router: Router, public navCtrl: NavController) {
    console.error(router);
  }

  navigate(url: string) {
    this.navCtrl.navigateForward(url);
  }
}
