import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCursor]',
  exportAs: 'cursor'
})
export class CursorDirective {

  constructor(private element: ElementRef) {
  }

  getPos() {
    if ('selectionStart' in this.element.nativeElement) {
      return this.element.nativeElement.selectionStart;
    } else if (document.getSelection()) {
      this.element.nativeElement.focus();
      const sel = document.createRange();
      console.log(document.createRange());
      const selLen = document.getSelection().anchorOffset;
      sel.setStart(this.element.nativeElement, 0);
      return sel.endOffset - selLen;
    }
  }

  setPos() {
    const range = document.createRange();
    if (range.startOffset !== undefined) {
      const selection = window.getSelection();
      range.setStart(this.element.nativeElement, 1);
      range.setEnd(this.element.nativeElement, 1);
      selection.removeAllRanges();
      selection.addRange(range);
      console.log('position set to: ', range.startOffset);
    }
  }
}
