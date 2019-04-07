import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
// tslint:disable-next-line: no-submodule-imports
import { AngularFireFunctionsModule } from '@angular/fire/functions';
// tslint:disable-next-line: no-submodule-imports
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from './environment.config';
import { RouterGuard } from './guards/router.guard';
import { ClipboardStoreModule } from './pages/clipboard/store/clipboard.module';
import { ClipboardServiceModule } from './services/clipboard/clipboard.module';
import { ElectronServiceModule } from './services/electron/electron.module';
import { GoogleAnalyticsServiceModule } from './services/google-analytics/google-analytics.module';
import { GoogleDriveServiceModule } from './services/google-drive/google-drive.module';
import { GoogleOAuth2ServiceModule } from './services/google-oauth2/google-oauth2.module';
import { GoogleTranslateServiceModule } from './services/google-translate/google-translate.module';
import { PreferencesServiceModule } from './services/preferences/preferences.module';
import { QuillCardServiceModule } from './services/quill-cards/quill-cards.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
    AngularFireStorageModule,
    PreferencesServiceModule,
    ElectronServiceModule,
    ClipboardServiceModule,
    QuillCardServiceModule,
    GoogleOAuth2ServiceModule,
    GoogleDriveServiceModule,
    GoogleTranslateServiceModule,
    GoogleAnalyticsServiceModule,
    ClipboardStoreModule,
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
