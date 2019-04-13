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
  @Input() disabled: {
    translate: boolean;
    star: boolean;
    remove: boolean;
  } = { translate: false, star: false, remove: false };
  @Output() removeClip = new EventEmitter();
  @Output() editClip = new EventEmitter();
  @Output() modifyClip = new EventEmitter();
  @Output() translateText = new EventEmitter();
  @Output() copyToClipboard = new EventEmitter();
  public view: 'plainView' | 'htmlView' = 'plainView';
  public hasMouseEntered = false;
  public isTranslating = false;

  constructor() {}

  get hasHtmlView() {
    return !!this.clip.htmlText;
  }

  switchView(view: 'plainView' | 'htmlView') {
    event.stopPropagation();
    this.view = view;
  }

  onClick(event: Event): void {
    this.copyToClipboard.emit({
      type: this.clip.type,
      content:
        this.clip.type === 'text'
          ? this.view === 'plainView'
            ? this.clip.translationView || this.clip.plainText
            : this.clip.htmlText
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
    this.isTranslating = !this.clip.translationView;
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
