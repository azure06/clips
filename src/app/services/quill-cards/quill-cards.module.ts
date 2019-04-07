import { NgModule } from '@angular/core';
import { IndexedDBServiceModule } from '../indexed-db/indexed-db.module';
import { QuillCardsService } from './quill-cards.service';

@NgModule({
  declarations: [],
  imports: [IndexedDBServiceModule],
  exports: [],
  providers: [QuillCardsService],
  bootstrap: []
})
export class QuillCardServiceModule {}
