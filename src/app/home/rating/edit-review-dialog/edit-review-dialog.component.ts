import { UIDialogRef, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bangumi } from '../../../entity';
import { RATING_TEXT } from '../rating.component';
import { ChromeExtensionService } from '../../../browser-extension/chrome-extension.service';

@Component({
    selector: 'edit-review-dialog',
    templateUrl: './edit-review-dialog.html',
    styleUrls: ['./edit-review-dialog.less']
})
export class EditReviewDialogComponent implements OnInit {
    private _toastRef: UIToastRef<UIToastComponent>;
    reviewForm: FormGroup;

    @Input()
    bangumi: Bangumi;

    @Input()
    comment: string;

    @Input()
    rating: number;

    @Input()
    tags: string;

    @Input()
    interest: number;

    hoverScore: number;
    isHovering: boolean;

    hoveringText = '';
    ratingText = '';

    constructor(private _dialogRef: UIDialogRef<EditReviewDialogComponent>,
                private _fb: FormBuilder,
                private _chromeExtensionService: ChromeExtensionService,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    onHoverRating(s: number) {
        this.isHovering = s > 0;
        this.hoverScore = s;
        if (!this.isHovering) {
            this.hoveringText = '';
        } else {
            this.hoveringText = RATING_TEXT[s];
        }
    }

    onSelectRating(s: number) {
        this.rating = s;
        this.ratingText = RATING_TEXT[s];
    }

    onSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }

    save(): void {
        if (this.reviewForm.invalid) {
            return;
        }

        const comment = this.reviewForm.value.comment;

        /**
         * export interface FavoriteStatus {
         *      interest: number;
         *      rating: number;
         *      tags: string;
         *      comment: string;
         * }
         */
        this._chromeExtensionService.invokeBangumiWebMethod('updateFavoriteStatus',
            [this.bangumi.bgm_id, {
                interest: this.interest,
                rating: this.rating,
                tags: this.tags,
                comment: comment
            }])
            .then(() => {
                this._dialogRef.close({
                    rating: this.rating,
                    comment: comment
                });
            }, (error) => {
                console.log(error);
                this._toastRef.show('更新失败');
            });
    }

    cancel(): void {
        this._dialogRef.close(null);
    }

    ngOnInit(): void {
        this.reviewForm = this._fb.group({
            comment: ['', Validators.maxLength(200)]
        });
        if (this.comment) {
            this.reviewForm.patchValue({comment: this.comment});
        }

        if (this.rating) {
            this.ratingText = RATING_TEXT[this.rating];
        }
    }
}
