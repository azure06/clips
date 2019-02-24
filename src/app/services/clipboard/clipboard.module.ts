import { NgModule } from '@angular/core';
import { ElectronServiceModule } from '../electron/electron.module';
import { IndexedDBServiceModule } from '../indexed-db/indexed-db.module';
import { ClipboardService } from './clipboard.service';

@NgModule({
  declarations: [],
  imports: [ElectronServiceModule, IndexedDBServiceModule],
  exports: [],
  providers: [ClipboardService],
  bootstrap: []
})
export class ClipboardServiceModule {}
