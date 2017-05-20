import { Component, Input } from '@angular/core';
import { UIDialogRef } from 'deneb-ui';

@Component({
    selector: 'alert-dialog',
    templateUrl: './alert-dialog.html'
})
export class AlertDialog {
    @Input()
    confirmButtonText: string;

    @Input()
    title: string;

    @Input()
    content: string;


    constructor(private _dialogRef: UIDialogRef<AlertDialog>) {}

    confirm() {
        this._dialogRef.close('confirm');
    }
}
