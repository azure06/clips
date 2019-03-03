import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'sanitizeHtml' })
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  // Introduced keyvalue Pipe in angular 6
  transform(value: string, args: string[]): SafeHtml {
    // Allow to open links in a new window
    value = /^<a.*>.*<\/a>$/.test(value)
      ? value.replace('<a', '<a target="_blank"')
      : value;

    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
