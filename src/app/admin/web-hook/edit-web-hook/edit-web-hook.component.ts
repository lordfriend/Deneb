import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UIDialogRef } from 'deneb-ui';
import { AbstractControl, Form, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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
        },
        shared_secret: {
            'required': 'shared secret不能为空',
            'minlength': 'secret太短'
        }
    };

    webHookForm: FormGroup;

    webHookFormErrors = {
        name: [],
        description: [],
        url: [],
        shared_secret: []
    };


    deleteForm: FormGroup;

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
        this.webHookForm.patchValue({consecutive_failure_count: 0});
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

    deleteWebHook() {
        if (this.deleteForm.invalid) {
            return;
        }
        this._dialogRef.close({deleteWebHook: true});
    }

    nameValidation(control: AbstractControl): ValidationErrors | null {
        return control.value !== this.webHook.name ? {nameMismatch: true} : null;
    }


    ngOnInit(): void {
        this.webHookForm = this._fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            url: ['', Validators.required],
            shared_secret: ['', [Validators.required, Validators.minLength(5)]],
            status: [WebHook.STATUS_INITIAL],
            consecutive_failure_count: [0]
        });
        if (this.webHook) {
            this.deleteForm = this._fb.group({
                name: ['', this.nameValidation.bind(this)]
            });
        }

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
