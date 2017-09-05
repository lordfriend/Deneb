import { Component, Input, OnInit } from '@angular/core';
import { Bangumi } from '../../../entity/bangumi';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UIDialogRef } from 'deneb-ui';
import { User } from '../../../entity/user';

@Component({
    selector: 'bangumi-basic',
    templateUrl: './bangumi-basic.html',
    styleUrls: ['./bangumi-basic.less']
})
export class BangumiBasic implements OnInit {

    @Input()
    bangumi: Bangumi;

    bangumiForm: FormGroup;

    adminList: User[];

    constructor(private _fb: FormBuilder,
                private _dialogRef: UIDialogRef<BangumiBasic>) {
    }

    ngOnInit(): void {


        this.bangumiForm = this._fb.group({
            name: [this.bangumi.name, Validators.required],
            name_cn: [this.bangumi.name_cn, Validators.required],
            summary: this.bangumi.summary,
            air_date: [this.bangumi.air_date, Validators.required],
            air_weekday: this.bangumi.air_weekday,
            eps_no_offset: this.bangumi.eps_no_offset,
            status: this.bangumi.status,
            maintained_by_uid: this.bangumi.maintained_by ? this.bangumi.maintained_by.id: '',
            alert_timeout: this.bangumi.alert_timeout
        });
    }

    cancel() {
        this._dialogRef.close(null);
    }

    save() {
        this._dialogRef.close(this.bangumiForm.value);
    }
}
