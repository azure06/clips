import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { ClipboardEffects } from './effects/clipboard.effects';
import { clipboardReducer } from './reducers/clipboard.reducers';

@NgModule({
  imports: [
    StoreModule.forFeature('clipboard', clipboardReducer),
    EffectsModule.forFeature([ClipboardEffects])
  ]
})
export class ClipboardStoreModule {}
