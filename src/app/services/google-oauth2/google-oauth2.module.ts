import { NgModule } from '@angular/core';
import { ElectronServiceModule } from '../electron/electron.module';
import { GoogleAnalyticsServiceModule } from '../google-analytics/google-analytics.module';
import { GoogleOAuth2Service } from './google-oauth2.service';

@NgModule({
  declarations: [],
  imports: [ElectronServiceModule, GoogleAnalyticsServiceModule],
  exports: [],
  providers: [GoogleOAuth2Service],
  bootstrap: []
})
export class GoogleOAuth2ServiceModule {}
