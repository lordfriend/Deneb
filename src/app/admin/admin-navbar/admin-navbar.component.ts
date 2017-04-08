import {Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'admin-navbar',
    templateUrl: './admin-navbar.html',
    styleUrls: ['./admin-navbar.less'],
    encapsulation: ViewEncapsulation.None
})
export class AdminNavbar {
    @Input()
    navTitle: string;

    @Input()
    backLink: string;
}
