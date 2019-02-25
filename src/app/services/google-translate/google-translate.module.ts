import { NgModule } from '@angular/core';
import { ElectronServiceModule } from '../electron/electron.module';
import { GoogleTranslateService } from './google-translate.service';

@NgModule({
  declarations: [],
  imports: [ElectronServiceModule],
  exports: [],
  providers: [GoogleTranslateService],
  bootstrap: []
})
export class GoogleTranslateServiceModule {}
