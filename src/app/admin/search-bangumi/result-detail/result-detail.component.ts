import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {BangumiRaw} from '../../../entity/bangumi-raw';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminService} from '../../admin.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'result-detail',
    templateUrl: './result-detail.html',
    styleUrls: ['./result-detail.less']
})
export class ResultDetail implements OnChanges, OnDestroy {

    private _subscription = new Subscription();

    @Input()
    bgmId: number;

    @Input()
    showDetail: boolean = false;

    bangumi: BangumiRaw;

    bangumiForm: FormGroup;

    @Output()
    finish = new EventEmitter<BangumiRaw>();

    constructor(private _fb: FormBuilder, private _adminService: AdminService) {
        this.bangumiForm = this._fb.group({
            name: ['', Validators.required],
            name_cn: ['', Validators.required],
            summary: '',
            air_date: ['', Validators.required],
            air_weekday: 1,
            eps: 0
        });
    }

    back() {
        this.finish.emit(null);
    }

    done() {
        let formModel = this.bangumiForm.value;
        this.bangumi.name = formModel.name as string;
        this.bangumi.name_cn = formModel.name_cn as string;
        this.bangumi.summary = formModel.summary as string;
        this.bangumi.air_date = formModel.air_date as string;
        this.bangumi.air_weekday = formModel.air_weekday as number;
        this.finish.emit(this.bangumi);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('bgmId' in changes && changes['bgmId'].currentValue) {
            this.bangumiForm.reset();
            this.bangumi = null;
            this._subscription.add(
                this._adminService.queryBangumi(changes['bgmId'].currentValue)
                    .subscribe(
                        (bangumi: BangumiRaw) => {
                            this.bangumi = bangumi;
                            this.bangumiForm.patchValue(bangumi);
                        }
                    )
            );
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
