import {Component} from '@angular/core';
require('./admin.less');


@Component({
    selector: 'admin',
    templateUrl: './admin.html'
})
export class Admin {
    site_title = SITE_TITLE;
}
