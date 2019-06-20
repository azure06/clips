import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appFocusOn]'
})
export class FocusOnDirective implements OnChanges {
  @Input() focus = false;
  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.focus && changes.focus.currentValue) {
      // window.el = this.el.nativeElement;
      this.el.nativeElement.focus();
    }
  }
}
