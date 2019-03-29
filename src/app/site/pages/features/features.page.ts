import { Component } from '@angular/core';
// tslint:disable-next-line: no-submodule-imports
import { AngularFireStorage } from '@angular/fire/storage';
@Component({
  selector: 'app-features',
  templateUrl: './features.page.html',
  styleUrls: ['./features.page.scss']
})
export class FeaturesPage {
  constructor(private afs: AngularFireStorage) {}

  public async downloadForWindows() {
    console.error('here');
    const pathReference = this.afs.ref('windows-installer/Infiniti Clips.exe');
    const downloadUrl: string = await pathReference
      .getDownloadURL()
      .toPromise();

    const response: any = await fetch(downloadUrl, {
      mode: 'no-cors'
    });
    const blob = new Blob([response], { type: 'application/octet-stream' });

    const URL = window.URL;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.style.display = 'none';
    a.setAttribute('href', url);
    a.setAttribute('download', 'Infiniti Clips' + '.exe');
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('click'));
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
}
