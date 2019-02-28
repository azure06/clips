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
      const modifyClipWithSort = () => ({
        ...state,
        loading: false,
        clips: [
          action.payload.clip,
          ...state.clips.filter(clip => clip.id !== action.payload.clip.id)
        ]
      });
      const modifyClip = () => {
        const index = state.clips.findIndex(
          clip => clip.id === action.payload.clip.id
        );
        const clips = [...state.clips];
        clips[index] = action.payload.clip;
        return { ...state, loading: false, clips };
      };
      return action.payload.sort ? modifyClipWithSort() : modifyClip();
    }
    case ClipboardActionTypes.ModifyClipFailure: {
      return {
        loading: false,
        ...state
      };
    }

    case ClipboardActionTypes.RemoveClip: {
      return {
        ...state,
        loading: true
      };
    }
    case ClipboardActionTypes.RemoveClipSuccess: {
      const filteredArray = state.clips.filter(
        clip => clip.id !== action.payload.clip.id
      );
      return {
        ...state,
        clips: [...filteredArray],
        loading: false
      };
    }
    case ClipboardActionTypes.RemoveClipFailure: {
      return {
        loading: false,
        ...state
      };
    }

    case ClipboardActionTypes.LoadNext: {
      return {
        ...state,
        loading: true
      };
    }
    case ClipboardActionTypes.LoadNextSuccess: {
      console.error(action.payload.clips);
      return {
        ...state,
        clips: [...state.clips, ...action.payload.clips],
        loading: false
      };
    }
    case ClipboardActionTypes.LoadNextFailure: {
      return {
        ...state,
        loading: false
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
