/**
 * admin root
 */

import {Component} from 'angular2/core';
import {MdToolbar} from '@angular2-material/toolbar';

@Component({
    selector: 'deneb-admin',
    templateUrl: '/admin/app/app-component.html',
    directives: [MdToolbar]
})
export class App {
    // nothing need here
}