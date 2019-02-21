import { NgModule } from '@angular/core';
import { ElectronServiceModule } from '../electron/electron.module';
import { GoogleOAuth2Service } from './google-oauth2.service';

@NgModule({
  declarations: [],
  imports: [ElectronServiceModule],
  exports: [],
  providers: [GoogleOAuth2Service],
  bootstrap: []
})
export class GoogleOAuth2ServiceModule {}
