import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { empty, EMPTY, Observable, of } from 'rxjs';

import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';
import { Clip } from '../../../../models/models';
// import { ClipboardService } from '../../../../services/clipboard/clipboard.service';
import {
  AddClip,
  AddClipFailure,
  AddClipSuccess,
  ClipboardActionTypes,
  RemoveClip,
  ResetClip
} from '../actions/clipboard.actions';

@Injectable()
export class ClipboardEffects {
  constructor(private actions$: Actions) {}

  @Effect()
  addClip$: Observable<Action> = this.actions$.pipe(
    ofType<AddClip>(ClipboardActionTypes.AddClip),
    mergeMap(action => {
      console.error('Effects');
      return EMPTY.pipe(
        map(() => new AddClipSuccess({ clip: action.payload }))
      );
    }),
    catchError(error => of(new AddClipFailure({ error })))
  );
}
