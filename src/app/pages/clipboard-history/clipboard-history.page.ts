import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-clipboard-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor() {}

  loadData(event) {
    // setTimeout(() => {
    //   console.log('Done');
    //   event.target.complete();

    //   // App logic to determine if all data is loaded
    //   // and disable the infinite scroll
    //   if (data.length == 1000) {
    //     event.target.disabled = true;
    //   }
    // }, 500);
  }

  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }
}
