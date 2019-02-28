import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Clip } from '../../models/models';

@Component({
  selector: 'app-clipboard-item-component',
  templateUrl: './clipboard-item.component.html',
  styleUrls: ['./clipboard-item.component.scss']
})
export class ClipboardItemComponent {
  @Input() clip: any; // FIXME Should be like ClipDetails in clipboard-history.page.ts
  @Input() index;
  @Output() removeClip = new EventEmitter();
  @Output() modifyClip = new EventEmitter();
  @Output() translateText = new EventEmitter();
  public currentView: 'plainView' | 'htmlView' = 'plainView';
  public hasMouseEntered = false;

  constructor() {}

  get hasHtmlView() {
    return !!this.clip.htmlText;
  }

  invertCurrentView(view: 'plainView' | 'htmlView') {
    this.currentView =
      this.currentView === 'plainView' ? 'htmlView' : 'plainView';
  }

  onClick(event: Event): void {}

  onMouseEnter(event: MouseEvent) {
    this.hasMouseEntered = true;
  }

  onMouseLeave(event: MouseEvent) {
    this.hasMouseEntered = false;
  }

  onAddToBookmarkClick(event: Event): void {
    this.modifyClip.emit({
      ...this.clip,
      starred: !this.clip.starred
    });
  }

  onRemoveClick(event: Event): void {
    this.removeClip.emit(this.clip);
  }

  onTranslate(): void {
    this.translateText.emit(this.clip);
  }
}
