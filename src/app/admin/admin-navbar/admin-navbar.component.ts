import {Component, Input} from '@angular/core';

require('./admin-navbar.less');

@Component({
    selector: 'admin-navbar',
    templateUrl: './admin-navbar.html',
})
export class AdminNavbar {
    @Input()
    navTitle: string;
}
