import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmailConfirmService } from './email-confirm.service';
import { Subscription } from 'rxjs/Subscription';
@Component({
    selector: 'email-confirm',
    templateUrl: './email-confirm.html'
})
export class EmailConfirm implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    isLoading = false;

    emailValid = false;

    constructor(private _confirmService: EmailConfirmService) {
    }

    ngOnInit(): void {
        this.isLoading = true;
        if (window.location.search) {
            this._subscription.add(
                this._confirmService.confirmEmail(window.location.search)
                    .subscribe(() => {
                        this.isLoading = false;
                        this.emailValid = true;
                    }, () => {
                        this.isLoading = false;
                        this.emailValid = false;
                    })
            );
        }
    }

    ngOnDestroy(): void {
    }
}
