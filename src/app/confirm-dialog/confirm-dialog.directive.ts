import {Directive, EventEmitter, HostListener, Input, OnDestroy, Output} from '@angular/core';
import {UIDialog} from 'deneb-ui';
import {ConfirmDialogModal} from './confirm-dialog-modal.component';
import {Subscription} from 'rxjs';

@Directive({
    selector: '[confirmDialog]'
})
export class ConfirmDialogDirective implements OnDestroy {

    private _subscription = new Subscription();

    @Input()
    dialogTitle: string;

    @Input()
    dialogContent: string;

    @Output()
    onConfirm = new EventEmitter<any>();

    @Output()
    onCancel = new EventEmitter<any>();

    constructor(private _dialog: UIDialog) {}

    @HostListener('click', ['$event'])
    onClickHandler($event: MouseEvent) {
        $event.preventDefault();

        let _dialogRef = this._dialog.open(ConfirmDialogModal, {stickyDialog: true, backdrop: true});
        _dialogRef.componentInstance.title = this.dialogTitle;
        _dialogRef.componentInstance.content = this.dialogContent;
        this._subscription.add(
            _dialogRef.afterClosed()
                .subscribe(
                    (result: string) => {
                        if (result === 'confirm') {
                            this.onConfirm.emit('confirm');
                        } else {
                            this.onCancel.emit('cancel');
                        }
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
