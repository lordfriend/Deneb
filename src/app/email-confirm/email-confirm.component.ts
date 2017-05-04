import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmailConfirmService } from './email-confirm.service';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

@Component({
    selector: 'email-confirm',
    templateUrl: './email-confirm.html'
})
export class EmailConfirm implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    isLoading = true;

    emailValid = false;

    constructor(private _confirmService: EmailConfirmService,
                private _router: Router) {
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
        this._subscription.unsubscribe();
    }

    returnToHome() {
        this._router.navigateByUrl('/');
    }
}
