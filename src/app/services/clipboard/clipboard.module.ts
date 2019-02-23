import { NgModule } from '@angular/core';
import { ElectronServiceModule } from '../electron/electron.module';
import { IndexDBServiceModule } from '../index-db/index-db.module';
import { ClipboardService } from './clipboard.service';

@NgModule({
  declarations: [],
  imports: [ElectronServiceModule, IndexDBServiceModule],
  exports: [],
  providers: [ClipboardService],
  bootstrap: []
})
export class ClipboardServiceModule {}
