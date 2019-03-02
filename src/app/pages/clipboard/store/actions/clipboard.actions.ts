import { Action } from '@ngrx/store';
import { Clip } from '../../../../models/models';

// tslint:disable: max-classes-per-file
export enum ClipboardActionTypes {
  LoadNext = '[Clipboard Items] Load more Clipboard Item',
  LoadNextSuccess = '[Clipboard Items] Load more Clipboard Items Success',
  LoadNextFailure = '[Clipboard Items] Load more Clipboard Items Failure',

  AddClip = '[Clipboard Item] Add Clipboard Item',
  AddClipSuccess = '[Clipboard Item] Add Clipboard Item Success',
  AddClipFailure = '[Clipboard Item] Add Clipboard Item Failure',

  ModifyClip = '[Clipboard Item] Modify Clipboard Item',
  ModifyClipSuccess = '[Clipboard Item] Modify Clipboard Item Success',
  ModifyClipFailure = '[Clipboard Item] Modify Clipboard Item Failure',

  RemoveClip = '[Clipboard Item] Remove Clipboard Item',
  RemoveClipSuccess = '[Clipboard Item] Remove Clipboard Item Success',
  RemoveClipFailure = '[Clipboard Item] Remove Clipboard Item Failure',

  SetClips = '[Clipboard Items] Set all Clipboards items'
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
  constructor(public payload: { clip: Clip; sort?: boolean }) {}
}

export class ModifyClipSuccess implements Action {
  readonly type = ClipboardActionTypes.ModifyClipSuccess;
  constructor(public payload: { clip: Clip; sort?: boolean }) {}
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

export class RemoveClipSuccess implements Action {
  readonly type = ClipboardActionTypes.RemoveClipSuccess;
  constructor(public payload: { clip: Clip }) {}
}

export class RemoveClipFailure implements Action {
  readonly type = ClipboardActionTypes.RemoveClipFailure;
  constructor(public payload: { error: any }) {}
}

export class LoadNext implements Action {
  readonly type = ClipboardActionTypes.LoadNext;
  constructor(
    public payload: {
      limit?: number;
      index?: 'text' | 'categories' | 'type' | 'updatedAt' | 'createdAt';
      keyRange?: IDBKeyRange;
      direction?: IDBCursorDirection;
    }
  ) {}
}

export class LoadNextSuccess implements Action {
  readonly type = ClipboardActionTypes.LoadNextSuccess;
  constructor(public payload: { clips: Clip[] }) {}
}

export class LoadNextFailure implements Action {
  readonly type = ClipboardActionTypes.LoadNextFailure;
  constructor(public payload: { error: any }) {}
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
  | RemoveClipSuccess
  | RemoveClipFailure
  | LoadNext
  | LoadNextSuccess
  | LoadNextFailure
  | SetClips;
