import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges, Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { RATING_COLOR, RATING_TEXT } from '../rating.component';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';

@Component({
    selector: 'my-review',
    templateUrl: './my-review.html',
    styleUrls: ['./my-review.less']
})
export class MyReviewComponent implements AfterViewInit, OnChanges {
    private _toastRef: UIToastRef<UIToastComponent>;
    // exclude the first time OnChanges called.
    private _measured = false;

    @Input()
    comment: string;

    @Input()
    rating: number;

    expanded = false;
    needTrimText = false;

    @Output()
    editReview = new EventEmitter<any>();

    @ViewChild('reviewText') reviewTextRef: ElementRef;

    get ratingScore(): string {
        if (!this.rating) {
            return '0.0';
        }
        if (Math.floor(this.rating) === this.rating) {
            return this.rating + '.0';
        }
        return this.rating + '';
    }

    get ratingColor(): string {
        if (!this.rating) {
            return RATING_COLOR[0];
        }
        return RATING_COLOR[this.rating];
    }

    get ratingText(): string {
        if (!this.rating) {
            return RATING_TEXT[0];
        }
        return RATING_TEXT[this.rating];
    }

    constructor(toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    onClickEditReview() {
        this.editReview.emit('');
    }

    toggleComment(isExpanded) {
        this.expanded = isExpanded;
    }

    ngAfterViewInit(): void {
        if (this.comment) {
            this.measureCommentHeight();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('review' in changes && this._measured) {
            this.measureCommentHeight();
        }
    }

    private measureCommentHeight() {
        window.setTimeout(() => {
            const reviewTextEl = this.reviewTextRef.nativeElement as HTMLElement;
            const boundingHeight = reviewTextEl.getBoundingClientRect().height;
            if (boundingHeight < reviewTextEl.scrollHeight) {
                this.needTrimText = true;
            }
            if (!this._measured) {
                this._measured = true;
            }
        }, 100);
    }
}
