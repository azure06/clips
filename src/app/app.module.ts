import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterGuard } from './guards/router.guard';
import { ClipboardStoreModule } from './pages/clipboard/store/clipboard.module';
import { ClipboardServiceModule } from './services/clipboard/clipboard.module';
import { GoogleAnalyticsServiceModule } from './services/google-analytics/google-analytics.module';
import { GoogleDriveServiceModule } from './services/google-drive/google-drive.module';
import { GoogleOAuth2ServiceModule } from './services/google-oauth2/google-oauth2.module';
import { GoogleTranslateServiceModule } from './services/google-translate/google-translate.module';
import { PreferencesServiceModule } from './services/preferences/preferences.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    PreferencesServiceModule,
    GoogleOAuth2ServiceModule,
    GoogleDriveServiceModule,
    GoogleTranslateServiceModule,
    GoogleAnalyticsServiceModule,
    ClipboardStoreModule,
    ClipboardServiceModule,
    AppRoutingModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    RouterGuard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
