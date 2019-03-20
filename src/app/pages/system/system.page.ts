import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-system',
  templateUrl: './system.page.html',
  styleUrls: ['./system.page.scss']
})
export class SystemPage {
  sections: 'General' | 'Notifications' | 'Hotkeys' | 'Language';

  constructor(public router: Router) {}
}
