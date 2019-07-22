import {
    AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
    ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChromeExtensionService } from '../../../../browser-extension/chrome-extension.service';
import { Post } from '../comment.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'bangumi-comment-form',
    templateUrl: './comment-form.html',
    styleUrls: ['./comment-form.less']
})
export class CommentFormComponent implements OnInit, AfterViewInit, OnDestroy {
    private _subscription = new Subscription();

    @Input()
    bgmEpsId: number;
    @Input()
    lastview: string;
    @Input()
    formhash: string;

    @Input()
    avatar: string;

    @Input()
    post: Post;

    @Input()
    isRootPost: boolean;

    @Output()
    commentSent = new EventEmitter<any>();

    @Output()
    cancel = new EventEmitter<string>();

    newCommentForm: FormGroup;

    @ViewChild('textarea', {static: false}) textareaRef: ElementRef;

    constructor(private _fb: FormBuilder,
                private _chromeExtensionService: ChromeExtensionService) {
    }

    preventSubmit(event: Event) {
        event.stopPropagation();
        event.preventDefault();
    }

    addComment() {
        if (this.newCommentForm.invalid) {
            return;
        }
        let content = this.newCommentForm.value.content;
        let args = [
            this.bgmEpsId,
            content,
            0,
            this.lastview,
            this.formhash
        ];
        if (this.post) {
            args.push(Object.assign({related: this.post.id}, this.post.replyParameter));
        }
        if (this.post && !this.isRootPost) {
            content = content.replace(/<div class="quote">([^^]*?)<\/div>/, '')
                .replace(/<\/?[^>]+>/g, '')
                .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                .replace(/\B@([^\W_][\w]*)\b/g, '＠$1');
            if (content.length > 100) {
                content = content.slice(0, 100) + '...';
            }
            args[1] = `[quote][b]${this.post.author.name}[/b] 说：${this.post.content}[/quote]${content}`
        }
        this._subscription.add(
            this._chromeExtensionService.invokeBangumiWebMethod('newComment', args)
                .subscribe(result => {
                    this.newCommentForm.reset();
                    if (this.post) {
                        this.commentSent.next(Object.assign({replyPost: this.post}, result))
                    }
                    this.commentSent.next(result);
                }, (error) => {
                    console.log(error);
                    this.newCommentForm.reset();
                    this.commentSent.next(null);
                })
        );
    }

    cancelPost() {
        if (this.post) {
            this.cancel.emit(this.post.id);
        } else {
            this.cancel.emit(null);
        }
    }

    ngOnInit(): void {
        this.newCommentForm = this._fb.group({
            content: ['', Validators.required]
        });
    }

    ngAfterViewInit(): void {
        let textarea = this.textareaRef.nativeElement;
        if (textarea) {
            (textarea as HTMLTextAreaElement).focus();
        }
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
