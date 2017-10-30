import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UIDialogRef } from 'deneb-ui';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { WebHook } from '../../../entity/web-hook';

@Component({
    selector: 'edit-web-hook',
    templateUrl: './edit-web-hook.html',
    styleUrls: ['./edit-web-hook.less']
})
export class EditWebHookComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    @Input()
    webHook: WebHook;

    validationMessages = {
        name: {
            'required': '名字不能为空'
        },
        description: {
            'required': '描述不能为空'
        },
        url: {
            'required': 'url不能为空'
        }
    };

    webHookForm: FormGroup;

    webHookFormErrors = {
        name: [],
        description: [],
        url: []
    };

    constructor(private _dialogRef: UIDialogRef<EditWebHookComponent>,
                private _fb: FormBuilder) {
    }

    onFormChanged(errors: any, errorMessages: any, form: FormGroup) {
        for (const field in errors) {
            // clear previous error message array
            errors[field] = [];
            const control = form.get(field);
            if (control && control.dirty && control.invalid) {
                for (const key in control.errors) {
                    let messages = errorMessages[field];
                    errors[field].push(messages[key]);
                }
            }
        }
    }

    reset_count() {
        this.webHookForm.setValue({consecutive_failure_count: 0});
    }

    cancel() {
        this._dialogRef.close(null);
    }

    save() {
        if (this.webHookForm.invalid || this.webHookForm.pristine) {
            return;
        }
        const result = this.webHookForm.value as WebHook;
        this._dialogRef.close({result: result});
    }


    ngOnInit(): void {
        this.webHookForm = this._fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            url: ['', Validators.required],
            status: [WebHook.STATUS_INITIAL],
            consecutive_failure_count: [0]
        });
        this.onFormChanged(this.webHookFormErrors, this.validationMessages, this.webHookForm);

        this._subscription.add(
            this.webHookForm.valueChanges
                .subscribe(() => {
                    this.onFormChanged(this.webHookFormErrors, this.validationMessages, this.webHookForm);
                })
        );

        if (this.webHook) {
            this.webHookForm.patchValue(this.webHook);
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
