import {Component} from '@angular/core';
import {OnActivate, ComponentInstruction} from '@angular/router-deprecated';
import {BaseError} from '../error';
import {Title} from '@angular/platform-browser';


@Component({
  selector: 'error-page',
  template: require('./error.html'),
  providers: [Title]
})
export class ErrorComponent implements OnActivate {
  
  constructor(titleService: Title) {
    titleService.setTitle('出错了!');
  }

  errorMessage: string;

  errorStatus: string;

  routerOnActivate(nextInstruction:ComponentInstruction, prevInstruction:ComponentInstruction):any|Promise<any> {
    this.errorMessage = nextInstruction.params['message'];
    this.errorStatus = nextInstruction.params['status'];
    return null;
  }
}
