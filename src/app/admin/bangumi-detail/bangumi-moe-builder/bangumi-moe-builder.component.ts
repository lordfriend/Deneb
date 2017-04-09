import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UIDialogRef, UIToast, UIToastComponent, UIToastRef} from 'deneb-ui';
import {Subscription} from 'rxjs';
import {Bangumi} from '../../../entity/bangumi';
import {BangumiMoeService} from './bangumi-moe.service';
import {Tag} from './bangum-moe-entity';
import {Response} from '@angular/http';


@Component({
    selector: 'bangumi-moe-builder',
    templateUrl: './bangumi-moe-builder.html',
    styleUrls: ['./bangumi-moe-builder.less']
})
export class BangumiMoeBuilder implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    @Input()
    bangumi: Bangumi;

    selectedTags: Tag[];
    formatTags: Tag[];
    langTags: Tag[];
    miscTags: Tag[];
    categoryTags: Tag[];
    popularTeamTags: Tag[];
    popularBangumiTags: Tag[];

    constructor(private _bangumiMoeService: BangumiMoeService,
                private _dialogRef: UIDialogRef<BangumiMoeBuilder>,
                toastService: UIToast) {
        this._toastRef = toastService.makeText();
    }

    ngOnInit(): void {
        if (this.bangumi.bangumi_moe) {
            this._subscription.add(
                this._bangumiMoeService.fetchTagData(this.bangumi.bangumi_moe)
                    .subscribe(
                        (tags: Tag[]) => {
                            this.selectedTags = tags;
                        },
                        (error: Response) => {
                            this._toastRef.show(error.json());
                        }
                    )
            );
        } else {
            this.selectedTags = [];
        }
        this._subscription.add(
            this._bangumiMoeService.commonTags()
            .subscribe(
                (tags: Tag[]) => {
                    this.formatTags = tags.filter(tag => tag.type === 'format');
                    this.langTags = tags.filter(tag => tag.type === 'lang');
                    this.miscTags = tags.filter(tag => tag.type === 'misc');
                },
                (error: Response) => {
                    this._toastRef.show(error.json());
                }
            )
        );
        this._subscription.add(
            this._bangumiMoeService.miscTags()
                .subscribe(
                    (tags: Tag[]) => {
                        this.categoryTags = tags;
                    },
                    (error: Response) => {
                        this._toastRef.show(error.json());
                    }
                )
        );
        this._subscription.add(
            this._bangumiMoeService.popularTeamTags()
                .subscribe(
                    (tags: Tag[]) => {
                        this.popularTeamTags = tags;
                    },
                    (error: Response) => {
                        this._toastRef.show(error.json());
                    }
                )
        );
        this._subscription.add(
            this._bangumiMoeService.popoluarBangumTags()
                .subscribe(
                    (tags: Tag[]) => {
                        this.popularBangumiTags = tags;
                    },
                    (error: Response) => {
                        this._toastRef.show(error.json());
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    cancel() {
        this._dialogRef.close(null);
    }

    save() {
        let tags;
        if (this.selectedTags.length > 0) {
            tags = JSON.stringify(this.selectedTags);
        } else {
            tags = null;
        }
        this._dialogRef.close({result: tags});
    }
}
