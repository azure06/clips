import { Action } from '@ngrx/store';
import { Clip } from '../../../../models/models';

// tslint:disable: max-classes-per-file
export enum ClipboardActionTypes {
  SetClips = '[Clipboard Items] Set all Clipboards items',
  AddClip = '[Clipboard Item] Add Clipboard Item',
  RemoveClip = '[Clipboard Item] Remove Clipboard Item',
  Reset = '[Clipboard] Reset Clipboard',

  AddClipSuccess = '[Clipboard Item] Add Clipboard Item Success',
  AddClipFailure = '[Clipboard Item] Add Clipboard Item Failure'
}

export class SetClips implements Action {
  readonly type = ClipboardActionTypes.SetClips;
  constructor(public payload: { clips: Clip[] }) {}
}

export class AddClip implements Action {
  readonly type = ClipboardActionTypes.AddClip;
  constructor(public payload: { clip: Clip }) {}
}

export class RemoveClip implements Action {
  readonly type = ClipboardActionTypes.RemoveClip;
  constructor(public payload: { clip: Clip }) {}
}

export class ResetClip implements Action {
  readonly type = ClipboardActionTypes.Reset;
  constructor(public payload: { clip: Clip }) {}
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
  | SetClips
  | AddClipFailure
  | AddClipSuccess;
