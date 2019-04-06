import { Component, OnInit } from '@angular/core';
import Quill from 'quill';

const Delta = Quill.import('delta');

@Component({
  selector: 'app-editor-page',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss']
})
export class EditorPage implements OnInit {
  title: '';
  editor: Quill;
  change = new Delta();
  constructor() {}

  ngOnInit(): void {
    this.editor = new Quill('#editor-container', {
      modules: {
        toolbar: [
          // [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block']
        ]
      },
      placeholder: 'Compose...',
      theme: 'bubble' // or 'bubble'
    });

    const changes = localStorage.getItem('untitled');
    if (changes) {
      this.change = this.editor.setContents(JSON.parse(changes));
    }

    this.editor.on('text-change', delta => {
      this.change = this.change.compose(delta);
    });

    // Save periodically
    setInterval(() => {
      if (this.change.length() > 0) {
        console.log('Saving changes', this.change);
        /*     Send partial changes */
        // $.post('/your-endpoint', {
        //   partial: JSON.stringify(change)
        // });

        localStorage.setItem(
          this.title || 'untitled',
          JSON.stringify(this.editor.getContents())
        );
        this.change = new Delta();
      }
    }, 5 * 1000);
  }

  ionViewWillLeave() {
    localStorage.setItem(
      this.title || 'untitled',
      JSON.stringify(this.editor.getContents())
    );
  }
}
