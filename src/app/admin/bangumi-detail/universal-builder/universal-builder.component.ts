import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UIDialogRef, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs/index';
import { Bangumi } from '../../../entity';
import { Item } from '../../../entity/item';
import { FeedService } from '../feed.service';

@Component({
    selector: 'universal-builder',
    templateUrl: './universal-builder.html',
    styleUrls: ['./universal-builder.less']
})
export class UniversalBuilderComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    availableMode: string[];

    @Input()
    bangumi: Bangumi;

    @Input()
    modeList: string[];

    @Input()
    mode: string;

    itemList: Array<Item>;

    keywordControl: FormControl;

    isEdit: boolean;

    isSearching: boolean;
    noResultFound: boolean;

    constructor(private _feedService: FeedService,
                private _dialogRef: UIDialogRef<UniversalBuilderComponent>,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    cancel(): void {
        this._dialogRef.close(null);
    }

    delete(): void {
        let universalList = JSON.parse(this.bangumi.universal);
        for (let i = 0; i < universalList.length; i++) {
            if (universalList[i].mode === this.mode) {
                universalList.splice(i, 1);
                break;
            }
        }
        this._dialogRef.close({result: universalList});
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.keywordControl = new FormControl();
        let universalList;
        if (this.bangumi.universal) {
            universalList = JSON.parse(this.bangumi.universal) as {mode: string, keyword: string}[];
            this.availableMode = this.modeList.filter(mode => {
                if (!this.mode) {
                    return mode === this.mode || !universalList.some(u => u.mode === mode)
                }
                return !universalList.some(u => u.mode === mode);
            });
        } else {
            this.availableMode = this.modeList;
        }
        if (this.mode && universalList) {
            this.isEdit = true;
            this.keywordControl.patchValue(universalList.find(u => u.mode === this.mode).keyword);
        } else {
            this.isEdit = false;
            this.mode = this.availableMode[0];
            this.keywordControl.patchValue('');
        }
    }

    save(): void {
        let result = {mode: this.mode, keyword: this.keywordControl.value};
        if (!result.keyword && this.isEdit) {
            this.delete();
            return;
        }
        let universalList;
        if (this.bangumi.universal) {
            universalList = JSON.parse(this.bangumi.universal);
        } else {
            universalList = [];
        }
        if (this.isEdit) {
            for (let i = 0; i < universalList.length; i++) {
                if (universalList[i].mode === result.mode) {
                    universalList[i].keyword = result.keyword;
                    break;
                }
            }
        } else {
            universalList.push(result);
        }
        this._dialogRef.close({result: universalList});
    }

    selectMode(mode: string): void {
        this.mode = mode;
    }

    testFeed(): void {
        this.isSearching = true;
        this.noResultFound = false;
        const keyword = this.keywordControl.value;
        if (!keyword) {
            this._toastRef.show('请输入关键字');
            return;
        }
        this._subscription.add(
            this._feedService.queryUniversal(this.mode, keyword)
                .subscribe((result) => {
                    this.itemList = result;
                    this.noResultFound = this.itemList.length === 0;
                    this.isSearching = false;
                }, (error) => {
                    this.isSearching = false;
                    this._toastRef.show(error.message);
                })
        );
    }
}
