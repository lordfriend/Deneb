import {Component, Input, OnInit} from '@angular/core';
import {FeedService} from './feed.service';
import {FormControl} from '@angular/forms';
import {UIDialogRef} from 'deneb-ui';

@Component({
    selector: 'keyword-builder',
    templateUrl: './keyword-builder.html',
    styleUrls: ['./keyword-builder.less']
})
export class KeywordBuilder implements OnInit {

    @Input()
    keyword: string;
    @Input()
    siteName: string;

    libykCriteria: { t: string, q: string };

    itemList: { title: string, eps_no: number }[];

    availableTable = ['yyets', 'tokyo', 'dmhy'];

    keywordControl: FormControl;

    constructor(private _feedService: FeedService,
                private _dialogRef: UIDialogRef<KeywordBuilder>) {
        this.keywordControl = new FormControl('');
    }

    ngOnInit(): void {
        if (this.siteName === 'libyk_so') {
            if (this.keyword) {
                this.libykCriteria = JSON.parse(this.keyword);
                this.keywordControl.patchValue(this.libykCriteria.q);
            } else {
                this.libykCriteria = {
                    t: this.availableTable[0],
                    q: ''
                };
            }
        } else {
            this.keywordControl.patchValue(this.keyword);
        }
    }

    selectTable(table: string) {
        this.libykCriteria.t = table;
    }

    testFeed() {
        if (this.siteName === 'dmhy') {
            this._feedService.queryDmhy(this.keywordControl.value)
                .subscribe((result) => {
                    this.itemList = result;
                }, () => {
                });
        } else if (this.siteName === 'acg_rip') {
            this._feedService.queryAcgrip(this.keywordControl.value)
                .subscribe((result) => {
                    this.itemList = result;
                }, () => {
                });
        } else if (this.siteName === 'libyk_so') {
            this._feedService.queryLibyk_so({t: this.libykCriteria.t, q: this.keywordControl.value})
                .subscribe((result) => {
                    this.itemList = result;
                }, () => {
                });
        }
    }

    cancel() {
        this._dialogRef.close(null);
    }

    save() {
        let keywordModel = this.keywordControl.value;
        let result;
        if (this.siteName === 'libyk_so') {
            if (keywordModel) {
                result = JSON.stringify({t: this.libykCriteria.t, q: keywordModel});
            } else {
                result = null;
            }
        } else {
            if(keywordModel) {
                result = keywordModel;
            } else {
                result = null;
            }

        }
        this._dialogRef.close({keyword: result});
    }
}
