import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { clipboardReducer } from './reducers/clipboard.reducers';
// import { TodoEffects } from './effects';

@NgModule({
  imports: [
    StoreModule.forFeature('clipboard', clipboardReducer)
    // EffectsModule.forFeature([TodoEffects])
  ]
})
export class ClipboardStoreModule {}
