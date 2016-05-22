import {Component} from '@angular/core';
import {OnActivate, ComponentInstruction} from '@angular/router-deprecated';
import {BaseError} from '../error';


@Component({
  selector: 'error-page',
  template: require('./error.html')
})
export class ErrorComponent implements OnActivate {

  errorMessage: string;

  errorStatus: string;

  routerOnActivate(nextInstruction:ComponentInstruction, prevInstruction:ComponentInstruction):any|Promise<any> {
    this.errorMessage = nextInstruction.params['message'];
    this.errorStatus = nextInstruction.params['status'];
    return null;
  }
}
