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

  text = String('digite...');
  autoCompleteControl = new FormControl();
  isEditing = false;
  // TODO: fetch the options from Users and Users group
  options: string[] = ['One', 'Two', 'Three'];
  mentions: string[] = [];
  isMentioning = false;

  @ViewChild(MatAutocompleteTrigger) inputAuto: MatAutocompleteTrigger;
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
    const filterValue = value && value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  private openAutoCompletePanel() {
    this.inputAuto.openPanel();
  }

  private dismissAutocompletePanel() {
    this.inputAuto.closePanel();
    this.autoCompleteControl.setValue('');
    this.isMentioning = false;
  }

  /*
  * TODO:
  *  [x] on backspace clean @ char
  *  [] shortcut for activate autocomplete panel
  *  [] multiple mentions
  * */
  activateAutoComplete($event: any) {
    const {textContent} = $event.target;
    this.text = textContent;
  }

  /*
  * TODO:
  *  [x] when leave the autocomplete input clean values
  *  [] return focus to editable content at the end
  *  [x] close autocomplete panel
  * */
  handleKey($event: KeyboardEvent) {
    const {key, ctrlKey, code} = $event;
    console.log('keydown: ', $event);

    if (this.isMentioning) {
      if (key === 'Backspace') {
        this.autoCompleteControl.setValue(this.autoCompleteControl.value.slice(0, -1));
      } else if (code.match('Key')) {
        if (this.autoCompleteControl.value) {
          this.autoCompleteControl.setValue(`${this.autoCompleteControl.value}${key}`);
        } else {
          this.autoCompleteControl.setValue(key);
        }
      }
    }

    if (key === '@') {
      console.log('@ was pressed');
      this.inputAuto.openPanel();
      this.isMentioning = true;
      return;
    }

    if (code === 'Space') {
      console.log('Space was pressed.');
      if (this.inputAuto.panelOpen) {
        this.dismissAutocompletePanel();
        this.manageMentions();
      }
    }

    if (key === 'Enter') {
      $event.preventDefault();
      this.auto._keyManager.setActiveItem(this.auto._keyManager.activeItemIndex);
      this.dismissAutocompletePanel();
      this.manageMentions();
    }

    if (key === 'Backspace' && this.autoCompleteControl.value === '') {
      this.dismissAutocompletePanel();
    }

    if (ctrlKey && code === 'Space') {
      this.openAutoCompletePanel();
    }

    if (key === 'ArrowDown') {
      $event.preventDefault();
      this.auto._keyManager.setNextItemActive();
    }

    if (key === 'ArrowUp') {
      $event.preventDefault();
      this.auto._keyManager.setPreviousItemActive();
    }

    if (this.inputAuto.panelOpen) {
      this.inputAuto.updatePosition();
    }
  }

  handleFocus() {
    this.handlePlaceholder();
  }

  handleBlur() {
    this.handlePlaceholder();
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

  suggestionSelect($event: MatOptionSelectionChange) {
    console.log('suggestion selection event: ', $event);
    console.log('suggestion selection value: ', $event.source.value);
    const { source: {value}} = $event;
    // TODO: clean inputted value and set suggestion value selected
    const lastMentionIndex = this.text.lastIndexOf('@');
    const lastMentionLength = this.text.slice(lastMentionIndex, this.text.length).length;
    const substitute = `${this.text.substr(lastMentionIndex, lastMentionLength)}${value}`;
    const replaced = this.text.slice(0, lastMentionIndex);
    this.text = `${replaced}${substitute}`;
    this.dismissAutocompletePanel();
  }

  manageMentions() {
    const matches = this.text.match(/@[\w]{1,}/g);
    if (matches && matches.length) {
      this.mentions = matches.map(mention => mention.replace('@', ''));
    }

    console.log('mentions: ', this.mentions);
  }
}


