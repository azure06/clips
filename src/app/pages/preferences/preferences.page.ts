import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

interface Section {
  name: string;
  icon: string;
  subtitle?: string;
  path: string;
}

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss']
})
export class PreferencesPage implements OnInit {
  options: FormGroup;

  iam: Section[] = [
    {
      name: 'Account',
      icon: 'face',
      subtitle: 'Google Drive Sync',
      path: '/preferences/iam'
    }
  ];
  system: Section[] = [
    {
      name: 'General',
      icon: 'settings_ethernet',
      path: '/preferences/system?section=general'
    },
    // {
    //   name: 'Notifications',
    //   icon: 'notifications',
    //   path: '/preferences/system?section=notifications'
    // },
    {
      name: 'Goolgle Translate',
      icon: 'translate',
      path: '/preferences/system?section=translate'
    },
    {
      name: 'Hotkeys',
      icon: 'keyboard',
      path: '/preferences/system?section=hotkeys'
    },
    {
      name: 'Language',
      icon: 'language',
      path: '/preferences/system?section=language'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private navCtrl: NavController
  ) {
    // window.router = router;
  }

  ngOnInit() {
    this.options = this.fb.group({
      bottom: 0,
      top: 0
    });
  }

  async navigate(url: string) {
    await this.navCtrl.navigateRoot(url);
  }
}
