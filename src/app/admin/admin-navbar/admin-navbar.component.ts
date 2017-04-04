import {Component, Input} from '@angular/core';

@Component({
    selector: 'admin-navbar',
    templateUrl: './admin-navbar.html',
    styleUrls: ['./admin-navbar.less']
})
export class AdminNavbar {
    @Input()
    navTitle: string;
}
