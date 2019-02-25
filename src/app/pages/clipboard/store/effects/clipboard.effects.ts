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
  ClipboardActionTypes,
  ModifyClip,
  ModifyClipFailure,
  ModifyClipSuccess,
  RemoveClip,
  RemoveClipFailure,
  RemoveClipSuccess
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

  @Effect()
  modifyClip$: Observable<Action> = this.actions$.pipe(
    ofType<ModifyClip>(ClipboardActionTypes.ModifyClip),
    mergeMap(action => {
      return from(Promise.resolve()).pipe(
        map(
          () =>
            new ModifyClipSuccess({
              clip: action.payload.clip
            })
        )
      );
    }),
    catchError(error => of(new ModifyClipFailure({ error })))
  );

  @Effect()
  removeClip$: Observable<Action> = this.actions$.pipe(
    ofType<RemoveClip>(ClipboardActionTypes.RemoveClip),
    mergeMap(action => {
      return from(Promise.resolve()).pipe(
        map(
          () =>
            new RemoveClipSuccess({
              clip: action.payload.clip
            })
        )
      );
    }),
    catchError(error => of(new RemoveClipFailure({ error })))
  );

  ngrxOnRunEffects(resolvedEffects$: Observable<EffectNotification>) {
    return resolvedEffects$.pipe(
      tap(effect => 'this.clipboardService.updateElectronStore(effect)')
    );
  }
}
