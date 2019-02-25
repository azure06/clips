import { Action } from '@ngrx/store';
import { Clip } from '../../../../models/models';

// tslint:disable: max-classes-per-file
export enum ClipboardActionTypes {
  SetClips = '[Clipboard Items] Set all Clipboards items',

  AddClip = '[Clipboard Item] Add Clipboard Item',
  AddClipSuccess = '[Clipboard Item] Add Clipboard Item Success',
  AddClipFailure = '[Clipboard Item] Add Clipboard Item Failure',

  ModifyClip = '[Clipboard Item] Modify Clipboard Item',
  ModifyClipSuccess = '[Clipboard Item] Modify Clipboard Item Success',
  ModifyClipFailure = '[Clipboard Item] Modify Clipboard Item Failure',

  RemoveClip = '[Clipboard Item] Remove Clipboard Item',
  Reset = '[Clipboard] Reset Clipboard'
}

// Add Clip
export class AddClip implements Action {
  readonly type = ClipboardActionTypes.AddClip;
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

// Modify Clip
export class ModifyClip implements Action {
  readonly type = ClipboardActionTypes.ModifyClip;
  constructor(public payload: { clip: Clip }) {}
}

export class ModifyClipSuccess implements Action {
  readonly type = ClipboardActionTypes.ModifyClipSuccess;
  constructor(public payload: { clip: Clip }) {}
}

export class ModifyClipFailure implements Action {
  readonly type = ClipboardActionTypes.ModifyClipFailure;
  constructor(public payload?: { error: any }) {}
}

// Remove Clip
export class RemoveClip implements Action {
  readonly type = ClipboardActionTypes.RemoveClip;
  constructor(public payload: { clip: Clip }) {}
}

export class ResetClip implements Action {
  readonly type = ClipboardActionTypes.Reset;
  constructor(public payload: { clip: Clip }) {}
}

// Set Clip
export class SetClips implements Action {
  readonly type = ClipboardActionTypes.SetClips;
  constructor(public payload: { clips: Clip[] }) {}
}

export type ClipActions =
  | AddClip
  | AddClipSuccess
  | AddClipFailure
  | ModifyClip
  | ModifyClipSuccess
  | ModifyClipFailure
  | RemoveClip
  | ResetClip
  | SetClips;
