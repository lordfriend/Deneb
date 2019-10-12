import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    Injectable,
    Injector,
} from '@angular/core';
import { PRIMARY_OUTLET, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { interval as observableInterval } from 'rxjs/index';
import { filter, map, switchMap, throttleTime } from 'rxjs/internal/operators';
import { take } from 'rxjs/operators';
import { Bangumi, Episode } from '../entity';
import { VideoFile } from '../entity/video-file';
import { WatchProgress } from '../entity/watch-progress';
import { MIN_WATCHED_PERCENTAGE } from '../home/play-episode/play-episode.component';
import { WatchService } from '../home/watch.service';
import { PersistStorage } from '../user-service';
import { getComponentRootNode, VideoPlayerHelpers } from './core/helpers';
import { FloatPlayer } from './core/settings';
import { PlayState } from './core/state';
import { FLOAT_PLAYER_SCALE_RATIO, VideoPlayer } from './video-player.component';

@Injectable({
    providedIn: 'root'
})
export class VideoPlayerService {
    private _currentViewContainer: ElementRef;
    private _videoPlayerComponentRef: ComponentRef<VideoPlayer>;

    /**
     * must unsubscribe when VideoPlayer destroyed.
     */
    private _videoPlayerSubscription: Subscription;

    private _state: PlayState = PlayState.INITIAL;
    private _pendingState: PlayState = PlayState.INVALID;

    private _episode: Episode;
    private _bangumi: Bangumi;
    private _nextEpisode: Episode;
    private _videoFileId: string;
    private _autoFloatPlayWhenScroll: boolean;
    private _autoFloatPlayWhenLeave: boolean;

    private _watchStatusChanges = new Subject<Episode>();
    private _bangumiFavoriteChanges = new Subject<Bangumi>();
    private _playNextEpisode = new Subject<string>();
    private _playerMeasuredWidth: number;
    private _playerMeasuredHeight: number;

    /*  */
    private _onScrolling = new Subject<boolean>();

    isPortrait: boolean;

    get onScrolling(): Observable<boolean> {
        return this._onScrolling.asObservable();
    }

    /**
     * Current watching Episode watch status changed. (only emits when WATCHING and WATCHED)
     * @type {Subject<Episode>}
     */
    get onWatchStatusChanges(): Observable<Episode> {
        return this._watchStatusChanges.asObservable();
    }

    /**
     * Current watching bangumi status changed. (only emits when changed to WATCHED)
     * @type {Subject<Bangumi>}
     */
    get onBangumiFavoriteChange(): Observable<Bangumi> {
        return this._bangumiFavoriteChanges.asObservable();
    }

    get onPlayNextEpisode(): Observable<string> {
        return this._playNextEpisode.asObservable();
    }

    get isFloating(): boolean {
        if (!this._videoPlayerComponentRef) {
            return false;
        }
        return this._videoPlayerComponentRef.instance.isFloatPlay;
    }

    constructor(private _componentFactoryResolver: ComponentFactoryResolver,
                private _injector: Injector,
                private _appRef: ApplicationRef,
                private _watchService: WatchService,
                private _router: Router,
                private _persistent: PersistStorage) {
        this._persistent.subscribe(FloatPlayer.AUTO_FLOAT_WHEN_SCROLL)
            .subscribe(v => {
                this._autoFloatPlayWhenScroll = v === 'true';
            });
        this._persistent.subscribe(FloatPlayer.AUTO_FLOAT_WHEN_LEAVE)
            .subscribe(v => {
                this._autoFloatPlayWhenLeave = v === 'true';
            });
        this._autoFloatPlayWhenScroll = this._persistent.getItem(FloatPlayer.AUTO_FLOAT_WHEN_SCROLL, 'true') === 'true';
        this._autoFloatPlayWhenLeave = this._persistent.getItem(FloatPlayer.AUTO_FLOAT_WHEN_LEAVE, 'true') === 'true';
    }

    public onLoadAndPlay(container: ElementRef,
                         episode: Episode,
                         bangumi: Bangumi,
                         nextEpisode: Episode,
                         videoFile: VideoFile): void {
        this.isPortrait = VideoPlayerHelpers.isPortrait();
        const lastContainer = this._currentViewContainer;
        this._currentViewContainer = container;
        // create video player component if not exists.
        if (!this._videoPlayerComponentRef) {
            this._createNewPlayer();
        }
        if (this._videoPlayerComponentRef.instance.isFloatPlay) {
            if (lastContainer !== container) {
                this._reAttachPlayer();
            }
            this.leaveFloatPlay(false, true);
        }
        if (this._episode && this._episode.id === episode.id) {
            // same video situation
        } else {
            this._initializeData(episode, bangumi, nextEpisode, videoFile);
        }
    }

    /**
     * When a video player container is destroyed, this method is called by play-episode component
     * if the video playback state is playing, we enter a float play state, otherwise just destroy the player
     */
    public onContainerDestroyed(): void {
        if ((this._state != PlayState.PLAYING && this._pendingState != PlayState.PLAYING) || !this._autoFloatPlayWhenLeave ) {
            this.onDestroy();
        } else {
            if (this.isPortrait && this._isFloatPlayerTooSmall()) {
                // just do not create float player when screen is too small.
                this.onDestroy();
            } else {
                const videoPlayerElement = getComponentRootNode(this._videoPlayerComponentRef);
                const containerElement = this._currentViewContainer.nativeElement as HTMLElement;
                containerElement.removeChild(videoPlayerElement);
                document.body.appendChild(videoPlayerElement);
                this._currentViewContainer = null;
                this.enterFloatPlay();
            }
        }
    }

    /**
     * enter the float play state
     * this method may be invoked by PlayEpisode component directly without container destroyed.
     */
    public enterFloatPlay(): void {
        if (this._state !== PlayState.PLAYING
            && this._pendingState !== PlayState.PLAYING) {
            return;
        }
        const videoPlayer = this._videoPlayerComponentRef.instance;
        if (videoPlayer.isFloatPlay) {
            return;
        }
        if (this._currentViewContainer && !this._autoFloatPlayWhenScroll) {
            return;
        }
        // const lastMeasuredPlayerWidth = videoPlayer.playerMeasuredWidth;
        const lastMeasuredPlayerHeight = videoPlayer.playerMeasuredHeight;
        // apply size styles for container for the case container not destroyed
        if (this._currentViewContainer && !this.isPortrait) {
            const containerElement = this._currentViewContainer.nativeElement as HTMLElement;
            // containerElement.style.width = `${lastMeasuredPlayerWidth}px`;
            containerElement.style.height = `${lastMeasuredPlayerHeight}px`;
        }
        videoPlayer.toggleFloatPlay();
    }

    /**
     * leave the float play state,
     * this method may be invoked by PlayEpisode component directly without container destroyed.
     */
    public leaveFloatPlay(checkUrl: boolean, skipScroll: boolean): void {
        if (checkUrl) {
            const tree = this._router.parseUrl(window.location.pathname);
            const children = tree.root.children[PRIMARY_OUTLET];
            if (!children) {
                this._router.navigateByUrl(`/play/${this._episode.id}?video_id=${this._videoFileId}`);
                return;
            }
            const urlSegments = children.segments;
            if (urlSegments[0].path !== 'play'
                || urlSegments[1].path !== this._episode.id
                || (tree.queryParams['video_id'] && tree.queryParams['video_id'] !== this._videoFileId)) {
                this._router.navigateByUrl(`/play/${this._episode.id}?video_id=${this._videoFileId}`);
                return;
            }
        }
        const videoPlayer = this._videoPlayerComponentRef.instance;
        if (!videoPlayer.isFloatPlay) {
            return;
        }
        if (this._currentContainerIsPlayEpisode() && !skipScroll) {
            this._scrollToTop();
            return;
        }
        videoPlayer.toggleFloatPlay();
        if (this._currentViewContainer && !this.isPortrait) {
            // remove size styles
            const containerElement = this._currentViewContainer.nativeElement as HTMLElement;
            // containerElement.style.removeProperty('width');
            containerElement.style.removeProperty('height');
        }
    }

    public closeFloatPlayer() {
        if (this._currentContainerIsPlayEpisode()) {
            // if currently in PlayEpisode component, disable auto float until user enable.
            this._persistent.setItem(FloatPlayer.AUTO_FLOAT_WHEN_SCROLL, 'false');
            this.leaveFloatPlay(false, true);
            return;
        }
        this.onDestroy();
    }

    public requestFocus(): void {
        const videoPlayer = this._videoPlayerComponentRef.instance;
        videoPlayer.requestFocus();
    }

    /**
     * When a video player needed destroyed, all its related resources need release.
     * This is not the lifecycle callback of the service.
     */
    public onDestroy() {
        this._unloadCurrentPlayer();
        this._currentViewContainer = null;
        this._episode = null;
        this._bangumi = null;
        this._nextEpisode = null;
    }

    private _scrollToTop() {
        const step = 10;
        const totalDistance = document.documentElement.scrollTop;
        const co = totalDistance / ((step - 1) * (step -1));
        this._onScrolling.next(true);
        observableInterval(30).pipe(
            take(step),
            map((t) => {
                return Math.floor(totalDistance - co * t * t);
            }),)
            .subscribe((d) => {
                document.documentElement.scrollTop = d;
            }, () => {}, () => {
                this._videoPlayerComponentRef.instance.toggleFloatPlay();
                if (this._currentViewContainer) {
                    // remove size styles
                    const containerElement = this._currentViewContainer.nativeElement as HTMLElement;
                    // containerElement.style.removeProperty('width');
                    containerElement.style.removeProperty('height');
                }
                this._onScrolling.next(false);
            });
    }

    /**
     * detect whether current container is play episode.
     * @returns {boolean}
     */
    private _currentContainerIsPlayEpisode(): boolean {
        if (!this._currentViewContainer) {
            return false;
        }
        const container = this._currentViewContainer.nativeElement as HTMLElement;
        if (!container){
            return false;
        }
        return container.classList.contains('theater-backdrop');
    }

    private _createNewPlayer(): void {
        if (!this._currentViewContainer) {
            throw new Error('No container available');
        }
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(VideoPlayer);
        this._videoPlayerComponentRef = componentFactory.create(this._injector);
        this._appRef.attachView(this._videoPlayerComponentRef.hostView);
        const containerElement = this._currentViewContainer.nativeElement as HTMLElement;
        containerElement.appendChild(getComponentRootNode(this._videoPlayerComponentRef));
        this._eventSubscribe();
    }

    private _reAttachPlayer():void {
        const containerElement = this._currentViewContainer.nativeElement as HTMLElement;
        containerElement.appendChild(getComponentRootNode(this._videoPlayerComponentRef));
    }

    private _initializeData(episode: Episode, bangumi: Bangumi, nextEpisode: Episode, videoFile: VideoFile) {
        let startPosition = 0;
        if (episode.watch_progress) {
            startPosition =  episode.watch_progress.last_watch_position;
        }
        this._episode = Object.assign({}, episode);
        this._bangumi = Object.assign({}, bangumi);
        this._nextEpisode = Object.assign({}, nextEpisode);
        this._videoFileId = videoFile.id;
        this._videoPlayerComponentRef.instance.setData(this._episode, this._bangumi, this._nextEpisode, videoFile, startPosition);
    }

    private _eventSubscribe() {
        this._videoPlayerSubscription = new Subscription();
        const videoPlayer = this._videoPlayerComponentRef.instance;
        this._videoPlayerSubscription.add(
            videoPlayer.state.subscribe(s => {
                this._state = s;
            })
        );
        this._videoPlayerSubscription.add(
            videoPlayer.pendingState.subscribe(ps => {
                this._pendingState = ps;
            })
        );
        this._videoPlayerSubscription.add(
            videoPlayer.onPlayNextEpisode.subscribe(episodeId => {
                this._playNextEpisode.next(episodeId);
            })
        );
        this._videoPlayerSubscription.add(
            videoPlayer.duration.pipe(
                filter(duration => duration > 0),
                switchMap(duration => {
                    return videoPlayer.currentTime.pipe(
                        map(position => {
                            return {
                                position: position,
                                duration: duration
                            };
                        })
                    );
                }),
                map(({position, duration}) => {
                    // update episode watch progress
                    if (!this._episode.watch_progress) {
                        this._episode.watch_progress = new WatchProgress();
                        this._episode.watch_progress.bangumi_id = this._bangumi.id;
                        this._episode.watch_progress.episode_id = this._episode.id;
                        this._episode.watch_progress.watch_status = WatchProgress.WATCHING;
                        this._watchStatusChanges.next(Object.assign({}, this._episode));
                    }
                    this._episode.watch_progress.last_watch_position = position;
                    const percentage = position / duration;
                    const isFinished = position / duration >= MIN_WATCHED_PERCENTAGE;
                    if (this._episode.watch_progress.watch_status !== WatchProgress.WATCHED
                        && isFinished) {
                        this._episode.watch_progress.watch_status = WatchProgress.WATCHED;
                        this._watchStatusChanges.next(Object.assign({}, this._episode));
                    }
                    return {
                        position: position,
                        percentage: percentage,
                        isFinished: isFinished
                    };
                }),
                throttleTime(1000))
                .subscribe(({position, percentage, isFinished}) => {
                    this._watchService.updateWatchProgress(this._bangumi.id, this._episode.id, position, percentage, isFinished);
                })
        );

        this._videoPlayerSubscription.add(
            this.onWatchStatusChanges.pipe(
                filter(episode => {
                    return episode.watch_progress.watch_status === WatchProgress.WATCHED
                        && this._bangumi.favorite_status !== WatchProgress.WATCHED;
                }))
                .subscribe(() => {
                    const allWatched = this._bangumi.episodes
                        .every(episode => {
                            return episode.watch_progress
                                && episode.watch_progress.watch_status === WatchProgress.WATCHED;
                        });

                    if (allWatched) {
                        this._bangumi.favorite_status = Bangumi.WATCHED;
                        this._bangumiFavoriteChanges.next(Object.assign({}, this._bangumi));
                    }
                })
        );

        this._videoPlayerSubscription.add(
            videoPlayer.onPlayerDimensionChanged.pipe(
                filter(dimen => dimen && dimen.length == 2 && dimen[0] > 0 && dimen[1] > 0))
                .subscribe(dimen => {
                    this._playerMeasuredWidth = dimen[0];
                    this._playerMeasuredHeight = dimen[1];
                    if (this._currentViewContainer && this.isPortrait) {
                        const containerElement = this._currentViewContainer.nativeElement as HTMLElement;
                        containerElement.style.width = `${this._playerMeasuredWidth}px`;
                        containerElement.style.height = `${this._playerMeasuredHeight}px`;
                    }
                })
        );
    }

    private _unloadCurrentPlayer() {
        this._videoPlayerSubscription.unsubscribe();
        this._appRef.detachView(this._videoPlayerComponentRef.hostView);
        if (this._currentViewContainer) {
            const containerElement = this._currentViewContainer.nativeElement as HTMLElement;
            containerElement.removeChild(getComponentRootNode(this._videoPlayerComponentRef));
        }
        this._state = PlayState.INITIAL;
        this._pendingState = PlayState.INVALID;
        this._videoPlayerComponentRef.destroy();
        this._videoPlayerComponentRef = null;
    }

    private _isFloatPlayerTooSmall(): boolean {
        const scaledPlayerWidth = this._playerMeasuredWidth * FLOAT_PLAYER_SCALE_RATIO;
        const testStr = 'xaxaxaxaxaxaxaxaxa';
        const dv = document.createElement('div');
        //font-size: 1.2rem;
        //padding: 0.1em 1em;
        //white-space: nowrap;
        dv.style.fontSize = '1.2rem';
        dv.style.padding = '0.1em 1em';
        dv.style.whiteSpace = 'nowrap';
        dv.style.position = 'absolute';
        dv.style.top = '-1.2rem';
        dv.textContent = testStr;
        document.body.appendChild(dv);
        const rect =  dv.getBoundingClientRect();
        document.body.removeChild(dv);
        return rect.width > scaledPlayerWidth;
    }
}
