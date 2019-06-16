import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Announce } from '../../../entity/announce';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { UIDialogRef } from 'deneb-ui';
import { Bangumi } from '../../../entity';

export const MAX_DATE_RANGE = 7; // days

export function rangeLimitWithMaxRange(group: FormGroup) {
    let start_time = group.get('start_time').value;
    let end_time = group.get('end_time').value;
    let result = end_time > start_time ? null : {dateRange: 'invalid range'};
    result = !result ? (end_time - start_time <= MAX_DATE_RANGE * 24 * 3600 * 1000 ? null: {dateRange: 'exceed max range'}) : result;
    console.log(result);
    return result;
}

@Component({
    selector: 'edit-bangumi-recommend',
    templateUrl: './edit-bangumi-recommend.html',
    styleUrls: ['./edit-bangumi-recommend.less']
})
export class EditBangumiRecommendComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    @Input()
    announce: Announce;

    @Input()
    bangumi: Bangumi;

    recommendForm: FormGroup;

    validationMessages = {
        sort_order: {
            'required': 'sort order不能为空'
        },
        start_time: {
            'required': '开始时间不能为空',
        },
        end_time: {
            'required': '开始时间不能为空'
        },
        dateRange: {
            'invalid range': '结束时间不得早于开始时间',
            'exceed max range': `最长持续时间不得大于${MAX_DATE_RANGE}天`
        }
    };

    recommendFormErrors = {
        sort_order: [],
        image_url: [],
        start_time: [],
        end_time: []
    };

    constructor(private _fb: FormBuilder,
                private _dialogRef: UIDialogRef<EditBangumiRecommendComponent>) {

    }

    cancel() {
        this._dialogRef.close();
    }

    save() {
        if (this.recommendForm.invalid) {
            return;
        }
        let result = this.recommendForm.value;
        result.content = this.bangumi.id;
        result.position = Announce.POSITION_BANGUMI;
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
        this.recommendForm = this._fb.group({
            sort_order: [0, Validators.required],
            start_time: [moment(), Validators.required],
            end_time: [moment().add(7, 'day'), Validators.required]
        },{validator: rangeLimitWithMaxRange});
        if (this.announce) {
            this.bangumi = this.announce.bangumi;
            this.recommendForm.get('sort_order').patchValue(this.announce.sort_order);
            this.recommendForm.get('start_time').patchValue(moment(this.announce.start_time));
            this.recommendForm.get('end_time').patchValue(moment(this.announce.end_time));
        }

        this.onFormChanged(this.recommendFormErrors, this.validationMessages, this.recommendForm);

        this._subscription.add(
            this.recommendForm.valueChanges
                .subscribe(() => {
                    this.onFormChanged(this.recommendFormErrors, this.validationMessages, this.recommendForm);
                })
        );
    }

    ngOnDestroy(): void {
    }
}
