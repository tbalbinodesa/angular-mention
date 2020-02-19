import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  text = 'digite...';
  hiddenInput = '';
  autoCompleteControl = new FormControl();
  isEditing = false;
  // TODO: fetch the options from Users and Users group
  options: string[] = ['One', 'Two', 'Three'];

  @ViewChild('inputAuto') inputAuto: ElementRef;
  @ViewChild('trigger') trigger: MatAutocompleteTrigger;
  @ViewChild('fakeInput') fakeInput: ElementRef;
  @ViewChild('editableText') editableText: ElementRef;
  @ViewChild('auto') auto: MatAutocomplete;

  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.autoCompleteControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  /*
  * TODO:
  *  [] multiple mentions
  *  [] on backspace clean @ char
  *  [] shortcut for activate autocomplete panel
  * */
  activateAutoComplete($event: any) {
    console.log('event change fake: ', $event);
    console.log('text value: ', this.text);

    const { textContent } = $event.target;
    this.text = textContent;
    if (textContent && textContent.match(/@/g)) {
      console.log('valued matched');
      this.trigger.openPanel();
      this.hiddenInput = this.text.split('@')[1];
      console.log(this.hiddenInput);
    }
  }

  // TODO: this needs to match multiples @s not only the first
  increaseValue(value: string) {
    console.log(value, 'increase value method');
    if (this.editableText) {
      this.text = `${this.editableText.nativeElement.textContent.split('@')[0]}@${value}`;
    }
  }

  /*
  * TODO:
  *  [] when leave the autocomplete input clean values
  *  [] return focus to editable content at the end
  *  [] close autocomplete panel
  * */
  handleKey($event: KeyboardEvent) {
    const { key } = $event;
    if (key === 'Enter') {
      console.log('enter pressed');
      this.dismissAutocompletePanel();
    }

    if (key === 'Backspace' && this.hiddenInput === '') {
      console.log('backspace pressed without value on input');
      this.text = this.text.replace(/@$/g, '');
      this.handleCursor();
      this.dismissAutocompletePanel();
    }
  }

  suggestionSelect($event: MatOptionSelectionChange) {
    console.log('option selection changed: ', $event);
  }

  handleFocus($event: FocusEvent) {
    console.log('focus on text event: ', $event);
    this.handlePlaceholder();
  }

  handleBlur($event: FocusEvent) {
    console.log('blur on text event: ', $event);
    this.handlePlaceholder();
  }

  dismissAutocompletePanel() {
    console.log('trying to close autocomplete panel.');
    this.trigger.closePanel();
    this.editableText.nativeElement.focus();
  }

  handlePlaceholder() {
    switch (this.text) {
      case '':
        this.text = 'digite...';
        this.isEditing = false;
        break;
      case 'digite...':
        this.text = '';
        this.isEditing = true;
        break;
    }
  }

  handleCursor() {
    const range = new Range();
    const selection = window.getSelection();
    const node = this.editableText.nativeElement.childNodes[0];
    const offset = this.text.length - 1;

    console.log('node e offset: ', node, offset);

    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    this.editableText.nativeElement.focus();
  }
}


