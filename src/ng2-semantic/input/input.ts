import {
  Component,
  Directive,
  ViewChild,
  ElementRef,
  Input,
  Output,
  Provider,
  forwardRef,
  OnChanges,
  AfterContentInit,
  EventEmitter,
  Optional,
  SkipSelf,
  Self,
  Host
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor, NgControlName, NgControl} from '@angular/common';
import {BooleanFieldValue} from '../core/annotations/field-value';
import {UIError} from '../core/error/error';
import {Observable} from 'rxjs/Observable';

let nextUniqueId = 0;

const noop = () => {};

const UI_INPUT_CONTROL_VALUE_ACCESSOR = new Provider(NG_VALUE_ACCESSOR, {
  useExisting: forwardRef(() => UIInput),
  multi: true
});

// Invalid input type. Using one of these will throw an UIInputUnsupportedTypeError.
const UI_INPUT_INVALID_INPUT_TYPE = [
  'file',
  'radio',
  'checkbox',
];

export class UIInputUnsupportedTypeError extends UIError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by md-input.`);
  }
}


@Directive({
  selector: '[ui-message]',
  host: {
    '[class.ui-invalid]': '!valid && touched',
    '[class.floating-error]': 'true',
    '[class.ui]': 'true',
    '[class.pointing]': 'true',
    '[class.below]': 'align == "top"',
    '[class.basic]': 'true',
    '[class.label]': 'true',
    '[class.red]': '!valid && touched',
  }
})
export class UIMessage {
  @Input('ui-message')
  errorName: string;

  @Input()
  align: string = 'top';

  constructor(
    @Optional() @SkipSelf() @Host() public control: NgControl
  ) {}

  get valid(): boolean {
    return !this.control.control.errors || !this.control.control.errors[this.errorName];
  }

  get touched(): boolean {
    return this.control.touched;
  }

}

@Directive({
  selector: 'ui-input[ngControl]',
  host: {
    '[class.field]': 'true',
    '[class.error]': '!valid && touched'
  }
})
export class UIField {
  private _control: NgControl;

  constructor(
    @Self() cd: NgControl
  ) {
    this._control = cd;
  }

  get valid(): boolean {
    return this._control ? this._control.control.valid: false;
  }

  get touched(): boolean {
    return this._control ? this._control.control.touched: false;
  }

}


@Component({
  selector: 'ui-input',
  template: `
  <div class="ui-input-wrapper">
    <input #input 
           [type]="type"
           [autofocus]="autofocus"
           [id]="inputId"
           [attr.autocomplete]="autoComplete"
           [attr.list]="list"
           [attr.max]="max"
           [attr.maxlength]="maxLength"
           [attr.min]="min"
           [attr.minlength]="minLength"
           [(ngModel)]="value" 
           [placeholder]="placeholder" 
           [required]="required" 
           [disabled]="disabled"
           [readonly]="readOnly"
           [spellcheck]="spellCheck"
           [attr.step]="step"
           [attr.tabindex]="tabIndex"
           [attr.name]="name"
           (focus)="handleFocus($event)"
           (blur)="handleBlur($event)"
           (change)="handleChange($event)">
    <ng-content select="[ui-message]"></ng-content>
  </div>`,
  providers: [UI_INPUT_CONTROL_VALUE_ACCESSOR],
  host: {
    '(click)': 'focus()',
  }
})
export class UIInput implements ControlValueAccessor, OnChanges, AfterContentInit {

  private _value: any = '';
  private _focused: boolean = false;
  private _onChangeCallback: ( v: any) => void = noop;
  private _onTouchedCallback: () => void = noop;

  @Input() id: string = `ui-input-${nextUniqueId++}`;
  @Input() type: string = 'text';
  @Input() placeholder: string;
  @Input() autoComplete: string;
  @Input() @BooleanFieldValue() autofocus: boolean = false;
  @Input() list: string = null;
  @Input() max: string = null;
  @Input() maxLength: number = null;
  @Input() min: string = null;
  @Input() minLength: number = null;
  @Input() @BooleanFieldValue() required: boolean = false;
  @Input() @BooleanFieldValue() disabled: boolean = false;
  @Input() @BooleanFieldValue() readOnly: boolean = false;
  @Input() @BooleanFieldValue() spellCheck: boolean = false;
  @Input() step: number = null;
  @Input() tabIndex: number = null;
  @Input() name: string = null;

  @ViewChild('input') _inputElement: ElementRef;

  private _blurEmitter: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  private _focusEmitter: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  @Output('blur')
  get onBlur(): Observable<FocusEvent> {
    return this._blurEmitter.asObservable();
  }

  @Output('focus')
  get onFocus(): Observable<FocusEvent> {
    return this._focusEmitter.asObservable();
  }

  get value(): any {
    return this._value;
  }

  @Input() set value(v: any) {
    v = this._convertValueForInputType(v);
    if(v !== this._value) {
      this._value = v;
      //noinspection TypeScriptValidateTypes
      this._onChangeCallback(v);
    }
  }

  /** Readonly properties **/
  get focused() { return this._focused; }
  get empty() { return this._value == null || this._value === ''; }
  get characterCount(): number {
    return this.empty ? 0 : ('' + this._value).length;
  }
  get inputId(): string { return `${this.id}-input`; }

  focus() {
    this._inputElement.nativeElement.focus();
  }

  handleFocus(event: FocusEvent) {
    this._focused = true;
    this._focusEmitter.emit(event);
  }

  handleBlur(event: FocusEvent) {
    this._focused = false;
    this._onTouchedCallback();
    this._blurEmitter.emit(event);
  }

  handleChange(event: Event) {
    this.value = (<HTMLInputElement>event.target).value;
    this._onTouchedCallback();
  }

  writeValue(v:any):void {
    this._value = v;
  }

  registerOnChange(fn:any):void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn:any):void {
    this._onTouchedCallback = fn;
  }

  ngOnChanges(changes:{}) {
    this._validateConstrains();
  }


  ngAfterContentInit() {
    this._validateConstrains();
  }

  private _convertValueForInputType(v: any): any {
    switch (this.type) {
      case 'number': return parseFloat(v);
      default: return v;
    }
  }

  private _validateConstrains() {
    if(UI_INPUT_INVALID_INPUT_TYPE.indexOf(this.type) !== -1) {
      throw new UIInputUnsupportedTypeError(this.type);
    }
  }
}

export var INPUT_DIRECTIVES = [
  UIMessage,
  UIField,
  UIInput
];
