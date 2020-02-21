import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatOptionSelectionChange } from '@angular/material/core';

const MENTION_REGEX = new RegExp(/@[\w]+/g);

@Component({
  selector: 'app-mentions',
  templateUrl: './mentions.component.html',
  styleUrls: ['./mentions.component.css']
})
export class MentionsComponent implements OnInit {

  constructor() { }

  text = String('digite...');
  autoCompleteControl = new FormControl();
  isEditing = false;
  isMentioning = false;

  @ViewChild(MatAutocompleteTrigger) inputAuto: MatAutocompleteTrigger;
  @ViewChild('auto') auto: MatAutocomplete;
  @ViewChild('editable') editable: ElementRef;

  @Input() options: string[];
  @Output() mentions = new EventEmitter<string[]>();

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
    this.auto._keyManager.setActiveItem(-1);
    this.isMentioning = false;
    this.manageMentions();
  }

  private setSelectedText(value: string) {
    console.log('setSelectedText()');
    const lastMentionIndex = this.editable.nativeElement.textContent.lastIndexOf('@');
    const substitute = `@${value}`;
    const replaced = this.editable.nativeElement.textContent.slice(0, lastMentionIndex);
    this.editable.nativeElement.textContent = `${replaced}${substitute}`;
    const event = new InputEvent('input', { data: '', inputType: 'insertText', composed: true });
    this.editable.nativeElement.dispatchEvent(event);
  }

  private handleActiveItem() {
    if (this.auto._keyManager.activeItemIndex >= 0) {
      this.auto._keyManager.setActiveItem(this.auto._keyManager.activeItemIndex);
      this.auto.optionSelected.emit();
      this.setSelectedText(this.auto._keyManager.activeItem.value);
    }
  }

  activateAutoComplete($event: any) {
    console.log('activateAutoComplete()', $event);
    const {target: {textContent}} = $event;
    this.text = textContent;
    return;
  }

  /*
  * TODO:
  *  [] error on press enter, cursor returns to start position
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
      this.inputAuto.openPanel();
      this.isMentioning = true;
      return;
    }

    if (code === 'Space') {
      if (this.inputAuto.panelOpen) {
        this.dismissAutocompletePanel();
      }
    }

    if (key === 'Enter') {
      $event.preventDefault();
      this.handleActiveItem();
      this.dismissAutocompletePanel();
      return;
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
    console.log('focused');
    this.handlePlaceholder();
  }

  handleBlur() {
    console.log('blurred');
    this.handlePlaceholder();
  }

  handlePlaceholder() {
    switch (this.editable.nativeElement.textContent) {
      case '':
        this.editable.nativeElement.textContent = 'digite...';
        this.isEditing = false;
        break;
      case 'digite...':
        this.editable.nativeElement.textContent = '';
        this.isEditing = true;
        break;
    }
  }

  suggestionSelect($event: MatOptionSelectionChange) {
    const { source: {value}} = $event;
    this.setSelectedText(value);
    this.dismissAutocompletePanel();
  }

  manageMentions() {
    const matches = this.editable.nativeElement.textContent.match(MENTION_REGEX);
    if (matches && matches.length) {
      this.mentions.emit(matches.map(mention => mention.replace('@', '')));
    }
  }

}
