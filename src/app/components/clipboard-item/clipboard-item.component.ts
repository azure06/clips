import { Component, EventEmitter, Input, Output } from '@angular/core';
import { clipboard } from 'electron';
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
  @Output() modifyClip = new EventEmitter();
  @Output() translateText = new EventEmitter();
  public view: 'plainView' | 'htmlView' = 'plainView';
  public hasMouseEntered = false;

  constructor() {}

  get hasHtmlView() {
    return !!this.clip.htmlText;
  }

  switchView(view: 'plainView' | 'htmlView') {
    this.view = view;
  }

  onClick(event: Event): void {}

  onMouseEnter(event: MouseEvent) {
    this.hasMouseEntered = true;
  }

  onMouseLeave(event: MouseEvent) {
    this.hasMouseEntered = false;
  }

  onAddToBookmarkClick(event: Event): void {
    console.error(this.clip.categories.includes('starred'));
    this.modifyClip.emit({
      ...this.clip,
      categories: this.clip.categories.includes('starred')
        ? this.clip.categories.filter(category => category !== 'starred')
        : [...this.clip.categories, 'starred']
    });
  }

  onRemoveClick(event: Event): void {
    this.removeClip.emit(this.clip);
  }

  onTranslate(): void {
    if (!this.clip.translationView) {
      this.translateText.emit(this.clip);
    } else {
      this.modifyClip.emit({
        ...this.clip,
        translationView: ''
      });
    }
  }
}
