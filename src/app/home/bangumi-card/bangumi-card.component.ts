import {
    ChangeDetectionStrategy,
    Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Bangumi} from '../../entity/bangumi';
import {FAVORITE_LABEL} from '../../entity/constants';
import {InfiniteList, SCROLL_STATE} from 'deneb-ui';
import {Subscription} from 'rxjs/Subscription';
import {ImageLoadingStrategy} from './image-loading-strategy.service';
import {Router} from '@angular/router';
import { getRemPixel } from '../../../helpers/dom';

export const CARD_HEIGHT_REM = 16;

export const IMAGE_LOAD_DELAY = 1000;

@Component({
    selector: 'bangumi-card',
    templateUrl: './bangumi-card.html',
    styleUrls: ['./bangumi-card.less'],
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BangumiCard implements OnInit, OnDestroy, OnChanges {
    private _subscription = new Subscription();
    private _imageLoadDelayTimerId: number;

    @Input()
    bangumi: Bangumi;

    FAVORITE_LABEL = FAVORITE_LABEL;

    scrollState: SCROLL_STATE;
    imageLoaded: boolean = false;

    lazy: boolean;

    @ViewChild('image') imageRef: ElementRef;

    constructor(@Optional() private _infiniteList: InfiniteList,
                private _router: Router,
                private _imageLoadingStrategy: ImageLoadingStrategy) {
        this.lazy = !!_infiniteList;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('bangumi' in changes && changes['bangumi'].currentValue) {
            if (changes['bangumi'].currentValue !== changes['bangumi'].previousValue){
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

    jumpTo(bangumi_id) {
        this._router.navigate(['/bangumi', bangumi_id]);
    }

    private checkIfCanloadImage() {
        let image = this.imageRef.nativeElement as HTMLImageElement;
        if (this.imageLoaded || !this.bangumi || !image) {
            return;
        }
        let {width, height} = BangumiCard.getImageDimension();
        let imageUrl = `${this.bangumi.cover}?size=${width}x${height}`;
        if (!this.lazy) {
            image.src = imageUrl;
            return;
        }
        image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
        if (this._imageLoadingStrategy.hasLoaded(imageUrl)) {
            image.src = imageUrl;
        }
        if (this.scrollState === SCROLL_STATE.IDLE) {
            image.onload = () => {
                this._imageLoadingStrategy.addLoadedUrl(imageUrl)
            };
            this._imageLoadDelayTimerId = window.setTimeout(() => {
                image.src = imageUrl;
            }, IMAGE_LOAD_DELAY);
        } else if (this.scrollState === SCROLL_STATE.SCROLLING) {
            clearTimeout(this._imageLoadDelayTimerId);
        }
    }

    static getImageDimension(): {width: number, height: number} {
        return {
            width: getRemPixel(10),
            height: getRemPixel(13)
        };
    }
}
