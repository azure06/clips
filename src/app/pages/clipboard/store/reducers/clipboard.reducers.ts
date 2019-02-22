import { Clip } from '../../../../models/models';
import {
  ClipActions,
  ClipboardActionTypes
} from '../actions/clipboard.actions';

export interface State {
  clips: Clip[];
}

export const initialState: State = {
  clips: [
    {
      plainText: 'Believe that anything you can imagine',
      types: []
    }
  ]
};

export function clipboardReducer(state = initialState, action: ClipActions) {
  switch (action.type) {
    case ClipboardActionTypes.AddClip: {
      return {
        ...state
      };
    }

    case ClipboardActionTypes.AddClipSuccess: {
      return {
        ...state,
        clips: [action.payload.clip, ...state.clips]
      };
    }

    case ClipboardActionTypes.RemoveClip: {
      return {
        state: [...state.clips]
      };
    }

    case ClipboardActionTypes.Reset: {
      return {
        state: []
      };
    }

    default:
      return state;
  }
}

export const getClips = (state: State) => state.clips;
