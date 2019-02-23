import { Injectable } from '@angular/core';
import {
  Actions,
  Effect,
  EffectNotification,
  ofType,
  OnRunEffects
} from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { EMPTY, from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, mergeMap, tap } from 'rxjs/operators';
import { Clip } from '../../../../models/models';
import { ClipboardService } from '../../../../services/clipboard/clipboard.service';
import {
  AddClip,
  AddClipFailure,
  AddClipSuccess,
  ClipboardActionTypes,
  RemoveClip,
  ResetClip
} from '../actions/clipboard.actions';

@Injectable()
export class ClipboardEffects implements OnRunEffects {
  constructor(
    private actions$: Actions,
    private clipboardService: ClipboardService
  ) {}

  @Effect()
  addClip$: Observable<Action> = this.actions$.pipe(
    ofType<AddClip>(ClipboardActionTypes.AddClip),
    mergeMap(action => {
      return from(new Promise(resolve => setTimeout(resolve, 1000))).pipe(
        map(
          () =>
            new AddClipSuccess({
              clip: action.payload.clip
            })
        )
      );
    }),
    catchError(error => of(new AddClipFailure({ error })))
  );

  ngrxOnRunEffects(resolvedEffects$: Observable<EffectNotification>) {
    return resolvedEffects$.pipe(
      tap(effect => this.clipboardService.updateElectronStore(effect))
    );
  }
}
