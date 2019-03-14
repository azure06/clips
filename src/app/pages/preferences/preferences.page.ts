import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NavController } from '@ionic/angular';

interface Section {
  name: string;
  icon: string;
  subtitle?: string;
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
      subtitle: 'Goole Drive Sync'
    }
  ];
  system: Section[] = [
    {
      name: 'General',
      icon: 'settings_ethernet'
    },
    {
      name: 'Notifications',
      icon: 'notifications'
    },
    {
      name: 'Hotkeys',
      icon: 'keyboard'
    },
    {
      name: 'Language',
      icon: 'language'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit() {
    this.options = this.fb.group({
      bottom: 0,
      top: 0
    });
  }

  navigateRoot(url: string) {
    this.router.navigateByUrl(url);
  }
}
