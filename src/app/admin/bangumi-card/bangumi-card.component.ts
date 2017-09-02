import {
    Component, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import {Bangumi} from '../../entity/bangumi';
import { InfiniteList, SCROLL_STATE } from 'deneb-ui';
import { Subscription } from 'rxjs/Subscription';
import { ImageLoadingStrategy } from '../../home/bangumi-card/image-loading-strategy.service';

const IMAGE_LOAD_DELAY = 1000;

export const CARD_HEIGHT_REM = 16;

@Component({
    selector: 'bangumi-card',
    templateUrl: './bangumi-card.html',
    styleUrls: ['./bangumi-card.less'],
    encapsulation: ViewEncapsulation.None
})
export class BangumiCard implements OnInit, OnChanges, OnDestroy{
    private _subscription = new Subscription();
    private _imageLoadDelayTimerId: number;

    @Input()
    showAddedTag: boolean;

    @Input()
    bangumi: Bangumi;

    scrollState: SCROLL_STATE;
    imageLoaded: boolean = false;

    lazy: boolean;

    imageUrl: string;

    constructor(@Optional() private _infiniteList: InfiniteList,
                private _imageLoadingStrategy: ImageLoadingStrategy) {
        this.lazy = !!_infiniteList;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('bangumi' in changes && changes['bangumi'].currentValue) {
            if (changes['bangumi'].currentValue !== changes['bangumi'].previousValue) {
                this.imageLoaded = false;
            }
            this.checkIfCanloadImage();
        }
    }

    ngOnInit(): void {
        if (this.lazy) {
            this._subscription.add(
                this._infiniteList.scrollStateChange
                    .subscribe(
                        (state) => {
                            this.scrollState = state;
                            if (state === SCROLL_STATE.SCROLLING) {
                                this.checkIfCanloadImage();
                            } else if (state === SCROLL_STATE.IDLE) {
                                this.checkIfCanloadImage();
                            }
                        }
                    )
            );
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    onImageLoad() {
        this._imageLoadingStrategy.addLoadedUrl(this.bangumi.cover_image.url);
    }

    private checkIfCanloadImage() {
        if (this.imageLoaded || !this.bangumi || !this.bangumi.cover_image) {
            return;
        }
        if (!this.lazy) {
            this.imageUrl = this.bangumi.cover_image.url;
            return;
        }
        this.imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
        if (this._imageLoadingStrategy.hasLoaded(this.bangumi.cover_image.url)) {
            this.imageUrl = this.bangumi.cover_image.url;
        }
        if (this.scrollState === SCROLL_STATE.IDLE) {
            this._imageLoadDelayTimerId = window.setTimeout(() => {
                this.imageUrl = this.bangumi.cover_image.url;
            }, IMAGE_LOAD_DELAY);
        } else if (this.scrollState === SCROLL_STATE.SCROLLING) {
            clearTimeout(this._imageLoadDelayTimerId);
        }
    }
}
