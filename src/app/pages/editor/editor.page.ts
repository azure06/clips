import { Component } from '@angular/core';
import Quill from 'quill';

const Delta = Quill.import('delta');

@Component({
  selector: 'app-editor-page',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss']
})
export class EditorPage {
  editor: Quill;
  change = new Delta();
  constructor() {}

  ionViewDidEnter(): void {
    this.editor = new Quill('#editor-container', {
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block']
        ]
      },
      placeholder: 'Compose an epic...',
      theme: 'snow' // or 'bubble'
    });

    this.editor.on('text-change', delta => {
      this.change = this.change.compose(delta);
    });

    // Save periodically
    setInterval(() => {
      if (this.change.length() > 0) {
        console.log('Saving changes', this.change);
        /*
    Send partial changes
    $.post('/your-endpoint', {
      partial: JSON.stringify(change)
    });

    Send entire document
    $.post('/your-endpoint', {
      doc: JSON.stringify(quill.getContents())
    });
    */
        this.change = new Delta();
      }
    }, 5 * 1000);
  }
}
