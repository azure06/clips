import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'sanitizeHtml' })
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  // Introduced keyvalue Pipe in angular 6
  transform(value: string, args: string[]): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
