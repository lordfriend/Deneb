import { Component, OnDestroy } from '@angular/core';
import { UserService } from '../user-service/user.service';
import { User } from '../entity/user';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'admin',
    templateUrl: './admin.html',
    styleUrls: ['./admin.less']
})
export class Admin implements OnDestroy {
    private _subscription = new Subscription();

    site_title = SITE_TITLE;

    user: User;

    constructor(private _userService: UserService) {
        this._subscription.add(
            this._userService.userInfo
                .subscribe((u) => {
                    this.user = u;
                })
        );
    }


    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
