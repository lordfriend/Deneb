import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ChromeExtensionService, IAuthInfo } from '../../../browser-extension/chrome-extension.service';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

export interface PostUser {
    uid: string;
    username: string;
    url: string;
    avatar?: string;
    name: string;
    signature?: string;
}

export interface ReplyParameter {
    topic_id: string;
    post_id: string;
    sub_reply_id: string;
    sub_reply_uid: string;
    post_uid: string;
    sub_post_type: string;
}

export interface Quote {
    author: string;
    content: any;
}

export interface Post {
    id: string;
    date: number;
    author: PostUser;
    content: any;
    quote: Quote;
    subPosts: Post[];
    replyParameter?: ReplyParameter;
    is_self?: boolean;

    formOpen: boolean // ui property, not related to data
    isEditing: boolean // ui property
}

@Component({
    selector: 'bangumi-comment',
    templateUrl: './comment.html',
    styleUrls: ['./comment.less'],
    encapsulation: ViewEncapsulation.None
})
export class CommentComponent implements OnInit, OnDestroy {
    private _subscription = new Subscription();

    @Input()
    bgmEpsId: number;

    posts: Post[];

    // for bgm to valid post data
    lastview: string;
    formhash: string;

    newCommentForm: FormGroup;

    authInfo: IAuthInfo;

    rootFormOpen = false;

    constructor(private _chromeExtensionService: ChromeExtensionService) {
    }

    addComment(post: Post) {
        post.formOpen = true;
    }

    editComment(post: Post) {
        post.isEditing = true;
    }

    openRootForm() {
        this.rootFormOpen = true;
    }

    deleteComment(post: Post) {
        this._chromeExtensionService.invokeBangumiWebMethod('deleteComment', [post.id, this.formhash, this.bgmEpsId])
            .then(() => {
                for (let i = 0; i < this.posts.length; i++) {
                    if (post === this.posts[i]){
                        this.posts.splice(i, 1);
                        return;
                    }
                    if (this.posts[i].subPosts && this.posts[i].subPosts.length > 0) {
                        for (let j = 0; j < this.posts[i].subPosts.length; j++) {
                            if (post === this.posts[i].subPosts[j]) {
                                this.posts[i].subPosts.splice(j, 1);
                                return;
                            }
                        }
                    }
                }
            })
    }

    onCommentSent(result: any) {
        if (result === null) {
            this.rootFormOpen = false;
            // sometimes, bangumi return nothing. in this situation, we just refresh comment list.
            this.freshCommentList();
            return;
        }
        if (result.type === 'main') {
            this.rootFormOpen = false;
            this.posts.push(result.posts[0]);
        } else {
            let p = this.posts.find((post) => post.id === result.id);
            p.subPosts = p.subPosts.concat(result.posts.filter((post) => {
                for (let i = 0; i < p.subPosts.length; i++) {
                    if (p.subPosts[i].id === post.id) {
                        // filter out duplicated post
                        return false;
                    }
                }
                return true;
            }));
            console.log(p);
        }
        if (result.replyPost) {
            result.replyPost.formOpen = false;
        }
        // this.updatePostProperty(result.id, 'formOpen', false);
    }

    onCommentUpdate() {
        this.freshCommentList();
    }

    onCommentEditCancel(postId: string): void {
        this.updatePostProperty(postId, 'isEditing', false);
    }

    onCommentCancel(postId: string): void {
        console.log(postId);
        if (postId) {
            this.updatePostProperty(postId, 'formOpen', false);
        } else {
            this.rootFormOpen = false;
        }
    }

    private freshCommentList() {
        this._chromeExtensionService.invokeBangumiWebMethod('getCommentForEpisode', [this.bgmEpsId])
            .then((result: any) => {
                this.posts = result.posts;
                console.log(this.posts);
                if (result.newComment) {
                    this.lastview = result.newComment.lastview;
                    this.formhash = result.newComment.formhash;
                }
            });
    }

    private updatePostProperty(postId: string, property: string, value: any) {
        for(let i = 0; i < this.posts.length; i++) {
            let post = this.posts[i];
            if (post.id === postId) {
                post[property] = value;
                return;
            }
            if (post.subPosts && post.subPosts.length > 0) {
                for (let j = 0; j < post.subPosts.length; j++) {
                    let subPost = post.subPosts[j];
                    if (subPost.id === postId) {
                        subPost[property] = value;
                        return;
                    }
                }
            }
        }
    }

    ngOnInit(): void {
        this.freshCommentList();
        this._subscription.add(
            this._chromeExtensionService.authInfo
                .subscribe((authInfo) => {
                    this.authInfo = authInfo as IAuthInfo;
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}