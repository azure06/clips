import { NgModule } from '@angular/core';
import { ElectronServiceModule } from '../electron/electron.module';
import { ClipboardService } from './clipboard.service';

@NgModule({
  declarations: [],
  imports: [ElectronServiceModule],
  exports: [],
  providers: [ClipboardService],
  bootstrap: []
})
export class ClipboardServiceModule {}
