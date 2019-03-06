import { NgModule } from '@angular/core';
import { ElectronServiceModule } from '../electron/electron.module';
import { GoogleDriveService } from './google-drive.service';

@NgModule({
  declarations: [],
  imports: [ElectronServiceModule],
  exports: [],
  providers: [GoogleDriveService],
  bootstrap: []
})
export class GoogleDriveServiceModule {}
