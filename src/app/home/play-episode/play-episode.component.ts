import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { fromEvent as observableFromEvent, Subscription } from 'rxjs';
import { debounceTime, switchMap, throttleTime } from 'rxjs/internal/operators';

import { filter, mergeMap, tap } from 'rxjs/operators';
import { ChromeExtensionService, LOGON_STATUS } from '../../browser-extension/chrome-extension.service';
import { Bangumi, Episode } from "../../entity";
import { VideoFile } from '../../entity/video-file';
import { VideoPlayerService } from '../../video-player/video-player.service';
import { HomeChild, HomeService } from "../home.service";
import { WatchService } from '../watch.service';
import { FeedbackComponent } from './feedback/feedback.component';

export const MIN_WATCHED_PERCENTAGE = 0.95;


@Component({
    selector: 'play-episode',
    templateUrl: './play-episode.html',
    styleUrls: ['./play-episode.less']
})
export class PlayEpisode extends HomeChild implements OnInit, OnDestroy, AfterViewInit {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;
    private _isScrolling = false;

    episode: Episode;

    nextEpisode: Episode;

    isBangumiReady: boolean;

    commentEnabled: boolean;

    currentVideoFile: VideoFile;

    @ViewChild('videoPlayerContainer', {static: true}) videoPlayerContainer: ElementRef;

    constructor(homeService: HomeService,
                private _watchService: WatchService,
                private _titleService: Title,
                private _route: ActivatedRoute,
                private _router: Router,
                private _chromeExtensionService: ChromeExtensionService,
                private _dialogService: UIDialog,
                private _videoPlayerService: VideoPlayerService,
                toast: UIToast) {
        super(homeService);
        this._toastRef = toast.makeText();
    }

    feedback() {
        let dialogRef = this._dialogService.open(FeedbackComponent, {stickyDialog: true, backdrop: false});
        this._subscription.add(
            dialogRef.afterClosed().pipe(
                filter(result => !!result),
                mergeMap((result) => {
                    return this.homeService.sendFeedback(this.episode.id, this.currentVideoFile.id, result);
                }),)
                .subscribe(() => {
                    this._toastRef.show('已收到您的反馈');
                })
        );
    }

    onVideoFileChange(videoFile: VideoFile): void {
        let loc = window.location;
        if (!!loc.search) {
            let params = new URLSearchParams(loc.search);
            params.set('video_id', videoFile.id);
            loc.search = `?${params.toString()}`;
        } else {
            loc.search = `?video_id=${videoFile.id}`;
        }
    }

    focusVideoPlayer(event: Event) {
        let target = event.target as HTMLElement;
        if (target.classList.contains('theater-backdrop')) {
            this._videoPlayerService.requestFocus();
        }
    }

    onPlayNext(episodeId: string) {
        this._router.navigateByUrl(`/play/${episodeId}`);
    }

    ngOnInit(): void {
        let searchStr = window.location.search;
        let videoFileId = null;
        if (!!searchStr) {
            let params = new URLSearchParams(searchStr);
            videoFileId = params.get('video_id');
        }
        this._subscription.add(
            this._videoPlayerService.onPlayNextEpisode
                .subscribe(episodeId => {
                    this.onPlayNext(episodeId);
                })
        );
        this._subscription.add(
            this._route.params.pipe(
                tap(() => {
                    // scrollBackToTop;
                    document.documentElement.scrollTop = 0;
                }),
                switchMap((params) => {
                    let episode_id = params['episode_id'];
                    return this.homeService.episode_detail(episode_id)
                }),
                tap(episode => {
                    this.homeService.checkFavorite(episode.bangumi_id);
                }),
                switchMap((episode: Episode) => {
                    this.episode = episode;
                    if (videoFileId) {
                        this.currentVideoFile = this.episode.video_files
                            .filter(videoFile => videoFile.status === VideoFile.STATUS_DOWNLOADED)
                            .find(videoFile => videoFile.id === videoFileId);
                    } else {
                        this.currentVideoFile = this.episode.video_files
                            .find(videoFile => videoFile.status === VideoFile.STATUS_DOWNLOADED);
                    }
                    return this.homeService.bangumi_detail(episode.bangumi_id);
                }),)
                .subscribe(
                    (bangumi: Bangumi) => {
                        this.isBangumiReady = true;
                        this.episode.bangumi = bangumi;
                        let epsTitle = `${this.episode.bangumi.name} ${this.episode.episode_no} - ${SITE_TITLE}`;
                        this._titleService.setTitle(epsTitle);
                        this.nextEpisode = bangumi.episodes.find(e => {
                            return e.episode_no - this.episode.episode_no === 1 && e.status === Episode.STATUS_DOWNLOADED;
                        });
                        this._videoPlayerService.onLoadAndPlay(
                            this.videoPlayerContainer, this.episode, bangumi, this.nextEpisode, this.currentVideoFile);
                    },
                    error => console.log(error)
                )
        );

        this._subscription.add(
            this._chromeExtensionService.isEnabled.pipe(
                filter(enabled => enabled),
                switchMap(() => {
                    return this._chromeExtensionService.authInfo;
                }),
                filter(authInfo => !!authInfo),
                switchMap(() => {
                    return this._chromeExtensionService.isBgmTvLogon;
                }),
                filter(isLogon => isLogon === LOGON_STATUS.TRUE),)
                .subscribe(() => {
                    this.commentEnabled = true;
                })
        );
    }

    ngAfterViewInit(): void {
        const containerElement = this.videoPlayerContainer.nativeElement as HTMLElement;
        this._subscription.add(
            this._videoPlayerService.onScrolling
                .subscribe(isScrolling => {
                    this._isScrolling = isScrolling;
                })
        );
        this._subscription.add(
            observableFromEvent(window, 'scroll')
                .pipe(
                    filter(() => !this._isScrolling))
                .subscribe(() => {
                    const rect = containerElement.getBoundingClientRect();
                    // console.log(rect.bottom);
                    const navHeight = 50;
                    if (rect.bottom < navHeight && !this._videoPlayerService.isFloating) {
                        this._videoPlayerService.enterFloatPlay();
                    } else if (rect.bottom > navHeight && this._videoPlayerService.isFloating) {
                        this._videoPlayerService.leaveFloatPlay(false, true);
                    }
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
        this._videoPlayerService.onContainerDestroyed();
    }
}
