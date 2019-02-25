import { Clip } from '../../../../models/models';
import {
  ClipActions,
  ClipboardActionTypes
} from '../actions/clipboard.actions';

export interface State {
  loading: boolean;
  clips: Clip[];
}

export const initialState: State = {
  loading: false,
  clips: []
};

export function clipboardReducer(state = initialState, action: ClipActions) {
  switch (action.type) {
    // Add Clip
    case ClipboardActionTypes.AddClip: {
      return {
        ...state,
        loading: true
      };
    }
    case ClipboardActionTypes.AddClipSuccess: {
      return {
        ...state,
        loading: false,
        clips: [action.payload.clip, ...state.clips]
      };
    }
    case ClipboardActionTypes.AddClipFailure: {
      return {
        ...state,
        loading: false
      };
    }

    // Modify Clip
    case ClipboardActionTypes.ModifyClip: {
      return {
        ...state,
        loading: true
      };
    }
    case ClipboardActionTypes.ModifyClipSuccess: {
      const filteredArray = state.clips.filter(
        clip => clip.id !== action.payload.clip.id
      );
      return {
        ...state,
        clips: [action.payload.clip, ...filteredArray],
        loading: false
      };
    }
    case ClipboardActionTypes.ModifyClipFailure: {
      return {
        loading: false,
        ...state
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

    case ClipboardActionTypes.SetClips: {
      return {
        ...state,
        clips: action.payload.clips
      };
    }

    default:
      return state;
  }
}

export const getClips = (state: State) => state.clips;
export const isLoading = (state: State) => state.loading;
