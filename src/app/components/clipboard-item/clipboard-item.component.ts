import { Component, Input } from '@angular/core';
import moment from 'moment';
import { Clip } from '../../models/models';

@Component({
  selector: 'app-clipboard-item-component',
  templateUrl: './clipboard-item.component.html',
  styleUrls: ['./clipboard-item.component.scss']
})
export class ClipboardItemComponent {
  @Input()
  clip: Clip;
  @Input()
  index;

  constructor() {}

  get moment() {
    return moment;
  }

  onClick(event: Event): void {}
}
