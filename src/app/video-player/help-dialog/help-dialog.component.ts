import { Component, OnDestroy, OnInit } from '@angular/core';
import { UIDialogRef } from 'deneb-ui';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

export const KEY_ESC = 27;

@Component({
    selector: 'video-player-help-dialog',
    templateUrl: './help-dialog.html',
    styleUrls: ['./help-dialog.less']
})
export class VideoPlayerHelpDialog implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    constructor(private _dialogRef: UIDialogRef<VideoPlayerHelpDialog>) {
    }

    closeDialog(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this._dialogRef.close(null);
    }

    ngOnInit(): void {
        this._subscription.add(
            Observable.fromEvent(document, 'keyup')
                .map((event: KeyboardEvent) => {
                    return event.which;
                })
                .filter(code => code === KEY_ESC)
                .subscribe(() => {
                    this._dialogRef.close();
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
