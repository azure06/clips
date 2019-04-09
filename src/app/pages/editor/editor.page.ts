import { Component, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
// tslint:disable-next-line: no-submodule-imports
import uuidv4 from 'uuid/v4';
import { QuillCard } from '../../models/models';
import { QuillCardsService } from '../../services/quill-cards/quill-cards.service';

@Component({
  selector: 'app-editor-page',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss']
})
export class EditorPage implements OnInit, OnDestroy {
  public quillCards: Array<QuillCard<any>> = [];
  public quillCardsBehaviorSubject: BehaviorSubject<
    Array<QuillCard<any>>
  > = new BehaviorSubject(this.quillCards);
  public quillCardsObservable = this.quillCardsBehaviorSubject
    .asObservable()
    .pipe(
      map(quillCards =>
        quillCards.map(quillCard => {
          quillCard.dateFromNow = moment(quillCard.updatedAt).fromNow();
          return quillCard;
        })
      )
    );
  public quillCardTRSubject = new Subject<QuillCard<any>>();
  public subscription: Subscription;

  constructor(private quillCardService: QuillCardsService) {}

  async ngOnInit(): Promise<void> {
    this.quillCards = (await this.quillCardService.getAllQuillCards()).reverse();
    this.quillCardsBehaviorSubject.next(this.quillCards);

    this.subscription = this.quillCardTRSubject
      .asObservable()
      .pipe(
        concatMap(quillCard =>
          this.quillCardService
            .modifyQuillCard(quillCard)
            .catch(err => console.error('Quillcard transaction err: ', err))
            .then(res => {
              const index = this.quillCards.findIndex(
                _quillCard => _quillCard.id === quillCard.id
              );
              Object.keys(this.quillCards[index]).forEach(key => {
                this.quillCards[index][key] = quillCard[key];
              });
              this.quillCardsBehaviorSubject.next(this.quillCards);
              return res;
            })
        )
      )
      .subscribe(res => {
        console.error(res);
      });
  }

  public async addQuillCard() {
    const quillCard = {
      title: '',
      contents: {},
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      label: '',
      displayOrder: -1
    };
    const id = await this.quillCardService.addQuillCard(quillCard);
    this.quillCards = [{ id, ...quillCard }, ...this.quillCards];
    this.quillCardsBehaviorSubject.next(this.quillCards);
  }

  public modifyQuillCard(quillCard: QuillCard<any>) {
    this.quillCardTRSubject.next(quillCard);
  }

  public async removeQuillCard(quillCard: QuillCard<any>) {
    this.quillCards = this.quillCards.filter(
      _quillCard => _quillCard.id !== quillCard.id
    );
    await this.quillCardService.removeQuillCard(quillCard);
    this.quillCardsBehaviorSubject.next(this.quillCards);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
