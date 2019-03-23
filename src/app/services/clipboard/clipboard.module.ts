import { NgModule } from '@angular/core';
import { IndexedDBServiceModule } from '../indexed-db/indexed-db.module';
import { ClipboardService } from './clipboard.service';

@NgModule({
  declarations: [],
  imports: [IndexedDBServiceModule],
  exports: [],
  providers: [ClipboardService],
  bootstrap: []
})
export class ClipboardServiceModule {}
