import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './escape.pipe';
@NgModule({
  declarations: [SanitizeHtmlPipe],
  imports: [],
  providers: [],
  exports: [SanitizeHtmlPipe]
})
export class SanitizeHtmlPipeModule {}
