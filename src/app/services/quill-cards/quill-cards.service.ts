import { Injectable, NgZone } from '@angular/core';

import { QuillCard } from '../../models/models';
import { IndexedDBService } from '../indexed-db/indexed-db.service';

@Injectable()
export class QuillCardsService {
  constructor(private indexedDBService: IndexedDBService) {}

  public async getAllQuillCards() {
    return this.indexedDBService.getAllQuillCards();
  }

  public async addQuillCard(quillCard: QuillCard<any>) {
    return this.indexedDBService.addQuillCard(quillCard);
  }

  public async modifyQuillCard(quillCard: QuillCard<any>) {
    return this.indexedDBService.modifyQuillCard(quillCard);
  }

  public async removeQuillCard(quillCard: QuillCard<any>) {
    this.indexedDBService.removeQuillCard(quillCard);
  }
}
