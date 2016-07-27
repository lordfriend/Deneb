import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
require('./admin.less');


@Component({
  selector: 'admin',
  template: require('./admin.html'),
  providers: [Title]
})
export class Admin {

}
