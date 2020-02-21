import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatOptionSelectionChange } from '@angular/material/core';
import { CursorDirective } from '../directives/cursor.directive';

const MENTION_REGEX = new RegExp(/@[\w]+/g);

@Component({
  selector: 'app-mentions',
  templateUrl: './mentions.component.html',
  styleUrls: ['./mentions.component.css']
})
export class MentionsComponent implements OnInit {

  constructor() {
  }

  editableText = String('digite...');
  autoCompleteControl = new FormControl();
  isEditing = false;
  isMentioning = false;

  @ViewChild(MatAutocompleteTrigger) inputAuto: MatAutocompleteTrigger;
  @ViewChild('auto') auto: MatAutocomplete;
  @ViewChild('editable') editable: ElementRef;
  @ViewChild('cursor') cursor: CursorDirective;

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
    const lastMentionIndex = this.editableText.lastIndexOf('@');
    const substitute = `@${value}`;
    const replaced = this.editableText.slice(0, lastMentionIndex);
    const event = new InputEvent('input', {
      data: `${replaced}${substitute}`,
      inputType: 'insertText',
      isComposing: false,
      composed: true,
      bubbles: true
    });
    this.editable.nativeElement.dispatchEvent(event);
  }

  private handleActiveItem() {
    if (this.auto._keyManager.activeItemIndex >= 0) {
      this.auto._keyManager.setActiveItem(this.auto._keyManager.activeItemIndex);
      this.auto.optionSelected.emit();
      this.setSelectedText(this.auto._keyManager.activeItem.value);
    }
  }

  editableTextInput($event: any) {
    const {data, target: {textContent}} = $event;
    if (data && data.length > 1) {
      this.editable.nativeElement.textContent = data;
      this.editableText = data;
      this.cursor.setPos();
    } else {
      this.editableText = textContent;
    }
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

  handleFocus(event) {
    console.log('focused');
    event.preventDefault();
    this.handlePlaceholder();
  }

  handleBlur(event) {
    console.log('blurred');
    event.preventDefault();
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
    const {source: {value}} = $event;
    console.log('suggestion event: ', value, $event);
    this.setSelectedText(value);
  }

  manageMentions() {
    const matches = this.editableText.match(MENTION_REGEX);
    if (matches && matches.length) {
      this.mentions.emit(matches.map(mention => mention.replace('@', '')));
    }
  }

}
