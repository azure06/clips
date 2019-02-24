import { Component, Input } from '@angular/core';
import { Clip } from '../../models/models';

@Component({
  selector: 'app-clipboard-item-component',
  templateUrl: './clipboard-item.component.html',
  styleUrls: ['./clipboard-item.component.scss']
})
export class ClipboardItemComponent {
  @Input() clip: Clip;
  @Input() index;
  public hasMouseEntered = false;

  constructor() {}

  onClick(event: Event): void {}

  onMouseEnter(event: MouseEvent) {
    this.hasMouseEntered = true;
  }

  onMouseLeave(event: MouseEvent) {
    this.hasMouseEntered = false;
  }
}
