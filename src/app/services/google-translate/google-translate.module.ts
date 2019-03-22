import { NgModule } from '@angular/core';
import { ElectronServiceModule } from '../electron/electron.module';
import { PreferencesServiceModule } from '../preferences/preferences.module';
import { GoogleTranslateService } from './google-translate.service';

@NgModule({
  declarations: [],
  imports: [ElectronServiceModule, PreferencesServiceModule],
  exports: [],
  providers: [GoogleTranslateService],
  bootstrap: []
})
export class GoogleTranslateServiceModule {}
