import { NgModule } from '@angular/core';
import { GoogleAnalyticsServiceModule } from '../google-analytics/google-analytics.module';
import { GoogleOAuth2Service } from './google-oauth2.service';

@NgModule({
  declarations: [],
  imports: [GoogleAnalyticsServiceModule],
  exports: [],
  providers: [GoogleOAuth2Service],
  bootstrap: []
})
export class GoogleOAuth2ServiceModule {}
