import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ChromeExtensionService } from '../../../../browser-extension/chrome-extension.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'bangumi-edit-comment',
    templateUrl: './edit-comment.html',
    styleUrls: ['./edit-comment.less']
})
export class EditCommentComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    private _formhash: string;

    @Input()
    postId;

    @Input()
    bgmEpsId;

    @Input()
    avatar: string;

    @Output()
    commentUpdate = new EventEmitter<any>();

    @Output()
    cancel = new EventEmitter<string>();

    isLoading = true;
    editCommentForm: FormGroup;

    constructor(private _chromeExtensionService: ChromeExtensionService,
                private _fb: FormBuilder,
                toast: UIToast) {
        this._toastRef = toast.makeText();
    }

    preventSubmit(event: Event) {
        event.stopPropagation();
        event.preventDefault();
    }

    updateComment() {
        if (this.editCommentForm.invalid) {
            return;
        }
        let content = this.editCommentForm.value.content;
        this._subscription.add(
            this._chromeExtensionService.invokeBangumiWebMethod('editComment', [this.postId, content, this._formhash, this.bgmEpsId])
                .subscribe(() => {
                    this.commentUpdate.emit(this.postId);
                })
        );
    }

    cancelEdit() {
        this.cancel.emit(this.postId);
    }

    ngOnInit(): void {
        this.editCommentForm = this._fb.group({
            content: ['', Validators.required]
        });
        this._subscription.add(
            this._chromeExtensionService.invokeBangumiWebMethod('getEditComment', [this.postId, this.bgmEpsId])
                .subscribe((result: any) => {
                    this.editCommentForm.patchValue({content: result.content});
                    this._formhash = result.formhash;
                    this.isLoading = false;
                }, () => {
                    this.isLoading = false;
                    this._toastRef.show('无法编辑评论');
                    this.cancel.emit(this.postId);
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
