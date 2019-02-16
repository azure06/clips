import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-clipboard-history-page',
  templateUrl: './clipboard-history.page.html',
  styleUrls: ['./clipboard-history.page.scss']
})
export class ClipboardHistoryPage {
  data: any = [
    100,
    23,
    321,
    312312,
    321,
    43,
    43,
    432,
    231,
    42,
    432,
    432,
    54,
    43,
    432,
    423,
    423,
    43,
    23,
    32,
    312,
    43,
    54
  ];
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor() {}

  loadData(event) {
    setTimeout(() => {
      console.log('Done');
      event.target.complete();
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      this.data.push(1232, 32, 432, 423, 423);
      // if (this.data.length === 1000) {
      // event.target.disabled = true;
      // }
    }, 500);
  }

  toggleInfiniteScroll() {
    // this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }
}
