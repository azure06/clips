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
  @Output() downloadClip = new EventEmitter();
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

  onDownloadClick(event: Event): void {
    this.downloadClip.emit(this.clip);
  }

  onRemoveClick(event: Event): void {
    this.removeClip.emit(this.clip);
  }
}
