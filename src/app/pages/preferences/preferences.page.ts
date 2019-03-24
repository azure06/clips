import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ElectronService } from '../../services/electron/electron.service';
import { PreferencesService } from '../../services/preferences/preferences.service';

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
  public options: FormGroup;
  public iam: Section[] = [
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
    {
      name: 'Google Translate',
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

  private bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private es: ElectronService,
    private preferenceService: PreferencesService,
    public router: Router
  ) {}

  ngOnInit() {
    this.options = this.fb.group({
      bottom: 0,
      top: 0
    });
  }

  ionViewWillEnter() {
    this.bounds = this.preferenceService.getAppSettings().bounds;
    this.es.mainWindow.center();
    this.es.mainWindow.setSize(800, 540, true);
    this.preferenceService.keepOpen = true;
  }

  ionViewDidLeave() {
    this.es.mainWindow.setPosition(this.bounds.x, this.bounds.y);
    this.es.mainWindow.setSize(this.bounds.width, this.bounds.height);
    this.preferenceService.keepOpen = false;
  }

  async navigate(url: string) {
    await this.navCtrl.navigateRoot(url);
  }
}
