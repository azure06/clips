import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromClips from './reducers/clipboard.reducers';
export { State, clipboardReducer } from './reducers/clipboard.reducers';

/**
 *  Selectors
 */
export const getFeatureState = createFeatureSelector<fromClips.State>(
  'clipboard'
);
export const getClips = createSelector(
  getFeatureState,
  fromClips.getClips
);
export const isLoading = createSelector(
  getFeatureState,
  fromClips.isLoading
);
