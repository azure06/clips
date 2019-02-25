import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Clip } from '../../models/models';

@Component({
  selector: 'app-clipboard-item-component',
  templateUrl: './clipboard-item.component.html',
  styleUrls: ['./clipboard-item.component.scss']
})
export class ClipboardItemComponent {
  @Input() clip: Clip;
  @Input() index;
  @Output() removeClip = new EventEmitter();
  public hasMouseEntered = false;

  constructor() {}

  onClick(event: Event): void {}

  onMouseEnter(event: MouseEvent) {
    this.hasMouseEntered = true;
  }

  onMouseLeave(event: MouseEvent) {
    this.hasMouseEntered = false;
  }

  remove(event: Event): void {
    this.removeClip.emit(this.clip);
  }
}
