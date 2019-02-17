import { Action } from '@ngrx/store';
import { Clip } from '../../../../models/models';

// tslint:disable: max-classes-per-file
export enum ClipboardActionTypes {
  AddClip = '[Clipboard Item] Add Clipboard Item',
  RemoveClip = '[Clipboard Item] Remove Clipboard Item',
  Reset = '[Clipboard] Reset Clipboard',

  AddClipSuccess = '[Clipboard Item] Add Clipboard Item Success',
  AddClipFailure = '[Clipboard Item] Add Clipboard Item Failure'
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

export class AddClipSuccess implements Action {
  readonly type = ClipboardActionTypes.AddClipSuccess;
  constructor(public payload: { clip: Clip }) {}
}

export class AddClipFailure implements Action {
  readonly type = ClipboardActionTypes.AddClipFailure;
  constructor(public payload?: { error: any }) {}
}

export type ClipActions =
  | AddClip
  | RemoveClip
  | ResetClip
  | AddClipFailure
  | AddClipSuccess;
