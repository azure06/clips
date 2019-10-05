import { Component, EventEmitter, Input, Output } from '@angular/core';
import moment = require('moment');
import { ClipDocType } from '../../services/clipboard/clipboard.models';

@Component({
  selector: 'app-clipboard-item-component',
  templateUrl: './clipboard-item.component.html',
  styleUrls: ['./clipboard-item.component.scss']
})
export class ClipboardItemComponent {
  @Input() clip: ClipDocType & {
    translationText?: string;
    compactText?: string;
    dateFromNow: string;
  };
  @Input() index;
  @Input() focus: boolean;

  @Output() removeClip = new EventEmitter();
  @Output() editClip = new EventEmitter();
  @Output() modifyClip = new EventEmitter();
  @Output() translateText = new EventEmitter();
  @Output() copyToClipboard = new EventEmitter();

  public view: 'plainTextView' | 'htmlTextView' = 'plainTextView';

  public hasMouseEntered = false;
  public isTranslating = false;

  switchView(view: 'plainTextView' | 'htmlTextView') {
    event.stopPropagation();
    this.view = view;
  }

  onClick(event: Event): void {
    this.copyToClipboard.emit({
      type: this.clip.type,
      content:
        this.clip.type === 'text'
          ? this.clip.translationText
            ? this.clip.translationText
            : this.view === 'htmlTextView'
            ? this.clip.htmlText
            : this.clip.plainText
          : this.clip.dataURI
    });
  }

  onMouseEnter(event: MouseEvent) {
    this.hasMouseEntered = true;
  }

  onMouseLeave(event: MouseEvent) {
    this.hasMouseEntered = false;
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.editClip.emit({ ...this.clip });
  }

  onAddToBookmarkClick(event: Event): void {
    event.stopPropagation();
    this.modifyClip.emit({
      ...this.clip,
      category: this.clip.category === 'starred' ? 'none' : 'starred'
    });
  }

  onRemoveClick(event: Event): void {
    event.stopPropagation();
    this.removeClip.emit(this.clip);
  }

  onTranslate(event: Event): void {
    event.stopPropagation();
    this.isTranslating = !this.clip.translationText;
    if (!this.clip.translationText) {
      this.translateText.emit(this.clip);
    } else {
      this.modifyClip.emit({
        ...this.clip,
        translationText: ''
      });
    }
  }
}
