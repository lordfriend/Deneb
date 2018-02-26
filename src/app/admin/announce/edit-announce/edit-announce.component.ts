import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UIDialogRef } from 'deneb-ui';
import { Announce } from '../../../entity/announce';
import moment from 'moment';
import { ECalendarValue, IDatePickerConfig } from 'ng2-date-picker';
import { Subscription } from 'rxjs/Subscription';

export function rangeLimit(group: FormGroup) {
    let start_time = group.get('start_time').value;
    let end_time = group.get('end_time').value;
    return end_time > start_time ? null: {dateRange: {end_time: end_time, start_time: start_time}};
}


@Component({
    selector: 'admin-edit-announce',
    templateUrl: './edit-announce.html',
    styleUrls: ['./edit-announce.less']
})
export class EditAnnounceComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    @Input()
    announce: Announce;

    announceForm: FormGroup;

    position = 1;

    dpConfig:IDatePickerConfig = {
        returnedValueType: ECalendarValue.Moment
    };


    validationMessages = {
        sort_order: {
            'required': 'sort order不能为空'
        },
        content: {
            'required': 'url不能为空'
        },
        image_url: {
            'required': 'image_url不能为空'
        },
        start_time: {
            'required': '开始时间不能为空',
        },
        end_time: {
            'required': '开始时间不能为空'
        }
    };


    announceFormErrors = {
        sort_order: [],
        content: [],
        image_url: [],
        start_time: [],
        end_time: []
    };


    constructor(private _dialogRef: UIDialogRef<EditAnnounceComponent>,
                private _fb: FormBuilder) {
    }

    onPositionChange(position: number) {
        this.position = position;
    }

    cancel() {
        this._dialogRef.close();
    }

    save() {
        if (this.announceForm.invalid) {
            return;
        }
        let result = this.announceForm.value;
        result.position = this.position;
        result.start_time = moment(result.start_time).valueOf();
        result.end_time = moment(result.end_time).valueOf();
        this._dialogRef.close(result);
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

    ngOnInit(): void {
        if (this.announce) {
            this.announceForm = this._fb.group({
                sort_order: [this.announce.sort_order, Validators.required],
                content: [this.announce.content, Validators.required],
                image_url: [this.announce.image_url, Validators.required],
                start_time: [moment(this.announce.start_time), Validators.required],
                end_time: [moment(this.announce.end_time), Validators.required]
            }, {validator: rangeLimit});
            this.position = this.announce.position;
        } else {
            this.announceForm = this._fb.group({
                sort_order: [0, Validators.required],
                content: ['', Validators.required],
                image_url: ['', Validators.required],
                start_time: [moment(), Validators.required],
                end_time: [moment().add(1, 'day'), Validators.required]
            }, {validator: rangeLimit})
        }

        this.onFormChanged(this.announceFormErrors, this.validationMessages, this.announceForm);

        this._subscription.add(
            this.announceForm.valueChanges
                .subscribe(() => {
                    this.onFormChanged(this.announceFormErrors, this.validationMessages, this.announceForm);
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
