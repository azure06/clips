import { Component, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';
import { concatMap, map, withLatestFrom } from 'rxjs/operators';
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
  public quillCardsSearchFilter: BehaviorSubject<string> = new BehaviorSubject(
    ''
  );

  public quillCardsObservable = combineLatest(
    this.quillCardsBehaviorSubject.asObservable(),
    this.quillCardsSearchFilter.asObservable()
  ).pipe(
    map(([quillCards, value]) =>
      quillCards.reduce((acc, quillCard) => {
        const filterByLabel = () =>
          quillCard.label.toLowerCase().includes(value);
        const filterByText = () =>
          quillCard.plainText.toLowerCase().includes(value);
        const filterByTitle = () =>
          quillCard.title.toLowerCase().includes(value);

        const isDisplayed =
          value === ''
            ? true
            : filterByLabel() || filterByText() || filterByTitle();

        if (!isDisplayed) {
          return acc;
        } else {
          quillCard.dateFromNow = moment(quillCard.updatedAt).fromNow();
          acc.push(quillCard);
          return acc;
        }
      }, [])
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
      plainText: '',
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

  public onInput({ detail: { value } }: { detail: { value: string } }) {
    this.quillCardsSearchFilter.next(value.trim().toLowerCase());
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
