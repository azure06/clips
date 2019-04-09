import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import Quill from 'quill';
import { interval, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
// tslint:disable-next-line: no-submodule-imports
import uuidv4 from 'uuid/v4';
import { QuillCard } from '../../models/models';

const Delta = Quill.import('delta');

@Component({
  selector: 'app-quill-card',
  templateUrl: './quill-card.component.html',
  styleUrls: ['./quill-card.component.scss']
})
export class QuillCardComponent implements AfterViewInit, OnDestroy {
  @Input() quillCard: QuillCard<typeof Delta>;
  @Output() modifyQuillCard = new EventEmitter<QuillCard<typeof Delta>>();
  @Output() removeQuillCard = new EventEmitter<QuillCard<typeof Delta>>();
  private quill: Quill;
  private change = new Delta();
  private title = { hasChange: false, value: '' };
  private label = { hasChange: false, value: '' };
  private subscription: Subscription;
  public containerId = `editor-container-${uuidv4()}`;
  constructor() {}

  private get _quillCard() {
    return {
      ...this.quillCard,
      title: this.title.value || this.quillCard.title,
      label: this.label.value || this.quillCard.label,
      contents: this.quill.getContents(),
      updatedAt: new Date().getTime()
    };
  }

  public ngAfterViewInit(): void {
    this.quill = new Quill(`#${this.containerId}`, {
      modules: {
        toolbar: [
          // [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['code-block']
        ]
      },
      placeholder: 'Compose...',
      theme: 'bubble' // or 'bubble'
    });

    if (this.quillCard.contents) {
      this.quill.setContents(this.quillCard.contents);
    }

    this.quill.on(
      'text-change',
      delta => (this.change = this.change.compose(delta))
    );
    this.subscription = interval(1500)
      .pipe(
        tap(() => {
          if (
            this.change.length() > 0 ||
            this.title.hasChange ||
            this.label.hasChange
          ) {
            this.title.hasChange = false;
            this.label.hasChange = false;
            this.modifyQuillCard.emit(this._quillCard);
            this.change = new Delta();
          }
        })
      )
      .subscribe();
  }

  public onTitleChange(event) {
    this.title = {
      hasChange: true,
      value: event.detail.value
    };
  }

  public onLabelChange(event) {
    this.label = {
      hasChange: true,
      value: event.detail.value
    };
  }

  public onRemoveQuillCard(event) {
    this.removeQuillCard.emit(this.quillCard);
  }

  public ngOnDestroy(): void {
    if (this.change.length() > 0 || this.title.hasChange) {
      this.title.hasChange = false;
      this.modifyQuillCard.emit(this._quillCard);
    }
    this.subscription.unsubscribe();
  }
}
