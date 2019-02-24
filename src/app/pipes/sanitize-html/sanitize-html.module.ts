import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
@NgModule({
  declarations: [SanitizeHtmlPipe],
  imports: [],
  providers: [],
  exports: [SanitizeHtmlPipe]
})
export class SanitizeHtmlPipeModule {}
