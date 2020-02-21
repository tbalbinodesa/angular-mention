import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMentions]',
  exportAs: 'mentions'
})
export class MentionsDirective {

  constructor(
    private el: ElementRef
  ) { }

  @Input() highlightColor: string;

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.background = this.highlightColor;
  }

}
