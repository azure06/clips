import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import * as fromClips from '../clipboard/store/index';
@Component({
  selector: 'app-clipboard',
  templateUrl: './clipboard.page.html',
  styleUrls: ['./clipboard.page.scss']
})
export class ClipboardPage {
  public isLoading = this.store.pipe(select(fromClips.isLoading));
  constructor(
    public router: Router,
    public navCtrl: NavController,
    public clipboardService: ClipboardService,
    private store: Store<fromClips.State>
  ) {}
  navigate(url: string) {
    this.navCtrl.navigateForward(url);
  }
}
