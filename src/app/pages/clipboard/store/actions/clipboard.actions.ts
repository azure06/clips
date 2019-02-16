import { Action } from '@ngrx/store';
import { Clip } from '../../../../models/models';

// tslint:disable: max-classes-per-file
export enum ClipboardActionTypes {
  AddClip = '[Clipboard Item] Add clipboard item',
  RemoveClip = '[Clipboard Item] Remove clipboard item',
  Reset = '[Clipboard] Reset clipboard'
}

export class AddClip implements Action {
  readonly type = ClipboardActionTypes.AddClip;
  constructor(public payload: Clip) {}
}

export class RemoveClip implements Action {
  readonly type = ClipboardActionTypes.RemoveClip;
  constructor(public payload: Clip) {}
}

export class ResetClip implements Action {
  readonly type = ClipboardActionTypes.Reset;
  constructor(public payload: Clip) {}
}

export type ClipActions = AddClip | RemoveClip | ResetClip;
