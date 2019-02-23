import { Injectable } from '@angular/core';
import {
  Actions,
  Effect,
  EffectNotification,
  ofType,
  OnRunEffects
} from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { ClipboardService } from '../../../../services/clipboard/clipboard.service';
import {
  AddClip,
  AddClipFailure,
  AddClipSuccess,
  ClipboardActionTypes
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
      return from(Promise.resolve()).pipe(
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
      tap(effect => 'this.clipboardService.updateElectronStore(effect)')
    );
  }
}
