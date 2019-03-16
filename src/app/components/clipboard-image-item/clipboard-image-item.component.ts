import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Clip } from '../../models/models';

@Component({
  selector: 'app-clipboard-image-item',
  templateUrl: './clipboard-image-item.component.html',
  styleUrls: ['./clipboard-image-item.component.scss']
})
export class ClipboardImageItemComponent {
  @Input() clip: Clip;
  @Input() index;
  @Output() removeClip = new EventEmitter();
  @Output() modifyClip = new EventEmitter();
  @Output() translateText = new EventEmitter();
  constructor() {}

  onAddToBookmarkClick(event: Event): void {
    this.modifyClip.emit({
      ...this.clip,
      category: this.clip.category === 'starred' ? 'none' : 'starred'
    });
  }

  onRemoveClick(event: Event): void {
    this.removeClip.emit(this.clip);
  }
}
