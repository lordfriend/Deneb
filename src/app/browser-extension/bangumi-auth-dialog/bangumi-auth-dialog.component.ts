import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChromeExtensionService } from '../chrome-extension.service';
import { UIDialogRef } from 'deneb-ui';

@Component({
    selector: 'bangumi-auth-dialog',
    templateUrl: './bangumi-auth-dialog.html',
    styleUrls: ['./bangumi-auth-dialog.less']
})
export class BangumiAuthDialogComponent implements OnInit {

    authForm: FormGroup;

    constructor(private _fb: FormBuilder,
                private _dialogRef: UIDialogRef<BangumiAuthDialogComponent>,
                private _injector: Injector) {
    }

    login(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.authForm.invalid) {
            return;
        }
        const value = this.authForm.value;
        console.log(value);
        const chromeExtensionService = this._injector.get(ChromeExtensionService);
        chromeExtensionService.invokeBangumiMethod('auth', [value.username, value.password])
            .then((data) => {
                this._dialogRef.close(data);
            }, (error) => {
                console.log(error);
            })
    }

    cancel() {
        this._dialogRef.close(null);
    }
    ngOnInit(): void {
        this.authForm = this._fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

}
