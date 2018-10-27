import { Component, OnInit, OnDestroy, ViewChild, PipeTransform, Pipe } from '@angular/core';
import { Episode, Bangumi } from "../../entity";
import { HomeService, HomeChild } from "../home.service";
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs/Rx';
import { Title } from '@angular/platform-browser';
import { WatchService } from '../watch.service';
import { WatchProgress } from '../../entity/watch-progress';
import { VideoPlayer } from '../../video-player/video-player.component';
import { VideoFile } from '../../entity/video-file';
import { ChromeExtensionService, LOGON_STATUS } from '../../browser-extension/chrome-extension.service';
import { UIDialog, UIToast, UIToastComponent, UIToastRef } from 'deneb-ui';
import { SynchronizeService } from '../favorite-chooser/synchronize.service';
import { Observable } from 'rxjs/Observable';
import { FeedbackComponent } from './feedback/feedback.component';

export const MIN_WATCHED_PERCENTAGE = 0.95;


@Component({
    selector: 'play-episode',
    templateUrl: './play-episode.html',
    styleUrls: ['./play-episode.less']
})
export class PlayEpisode extends HomeChild implements OnInit, OnDestroy {
    private _subscription = new Subscription();
    private _toastRef: UIToastRef<UIToastComponent>;

    private positionChange = new Subject<number>();

    private current_position: number | undefined;
    private duration: number;

    // private isUpdateHistory: boolean = false;

    get isFinished(): boolean {
        if (!this.current_position || !this.duration) {
            return false;
        }
        if (this.episode.watch_progress && this.episode.watch_progress.watch_status === WatchProgress.WATCHED) {
            return true;
        }
        return this.current_position / this.duration >= MIN_WATCHED_PERCENTAGE;
    }

    episode: Episode;

    nextEpisode: Episode;

    isBangumiReady: boolean;

    commentEnabled: boolean;

    currentVideoFile: VideoFile;

    @ViewChild(VideoPlayer) videoPlayer: VideoPlayer;

    constructor(homeService: HomeService,
                private _watchService: WatchService,
                private _titleService: Title,
                private _route: ActivatedRoute,
                private _router: Router,
                private _chromeExtensionService: ChromeExtensionService,
                private _synchronizeService: SynchronizeService,
                private _dialogService: UIDialog,
                toast: UIToast) {
        super(homeService);
        this._toastRef = toast.makeText();
    }

    feedback() {
        let dialogRef = this._dialogService.open(FeedbackComponent, {stickyDialog: true, backdrop: false});
        this._subscription.add(
            dialogRef.afterClosed()
                .filter(result => !!result)
                .flatMap((result) => {
                    return this.homeService.sendFeedback(this.episode.id, this.currentVideoFile.id, result);
                })
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
            this.videoPlayer.requestFocus();
        }
    }

    onWatchPositionUpdate(position: number) {
        this.current_position = position;
        this.updateEpisodeWatchProgress();
        this.positionChange.next(position);
        if (position === this.duration) {
            this.updateHistory(position);
        }
    }

    onDurationUpdate(duration: number) {
        this.duration = duration;
    }

    onPlayNext(episodeId: string) {
        this._router.navigateByUrl(`/play/${episodeId}`);
    }

    updateHistory(position) {
        // this.isUpdateHistory = true;
        let percentage = position / this.duration;
        if (Number.isNaN(percentage)) {
            return;
        }
        let isFinished = this.isFinished;
        if (this.episode.watch_progress && this.episode.watch_progress.watch_status === WatchProgress.WATCHED) {
            isFinished = true;
        }
        this._watchService.updateWatchProgress(this.episode.bangumi_id, this.episode.id, position, percentage, isFinished);
    }

    /**
     * update current episode watch_progress in memory
     */
    updateEpisodeWatchProgress() {
        if (!this.episode.watch_progress) {
            this.episode.watch_progress = new WatchProgress();
            this.episode.watch_progress.watch_status = WatchProgress.WATCHING;
            this.homeService.episodeWatching(this.episode.bangumi_id);
        }
        // this.episode.watch_progress.last_watch_position = this.current_position;
        if (this.episode.watch_progress.watch_status !== WatchProgress.WATCHED && this.isFinished) {
            this.updateBangumiFavorite();
        }
        // only change watch status when this episode is not finished.
        if (this.episode.watch_progress.watch_status !== WatchProgress.WATCHED) {
            this.episode.watch_progress.watch_status = this.isFinished ? WatchProgress.WATCHED : WatchProgress.WATCHING;
            if (this.episode.watch_progress.watch_status === WatchProgress.WATCHED) {
                this._subscription.add(
                    this.canSync()
                        .flatMap((result) => {
                            if (result.canSync) {
                                return this._chromeExtensionService.invokeBangumiMethod('updateEpisodeStatus', [this.episode.bgm_eps_id, 'watched']);
                            } else {
                                return Observable.throw(result.canSync);
                            }
                        })
                        .subscribe((result) => {
                            console.log('episode progress synchronized', result);
                            this._toastRef.show('已与Bangumi同步');
                        }, () => {
                            console.log('sync not enabled');
                        })
                );
            }
        }
    }

    /**
     * update bangumi favorite status to WATCHED
     */
    updateBangumiFavorite() {
        if (this.isBangumiReady) {
            let bangumi = this.episode.bangumi;
            let otherWatched = bangumi.episodes
                .filter((episode) => {
                    return episode.id !== this.episode.id;
                })
                .every((episode) => {
                    return episode.watch_progress && episode.watch_progress.watch_status === WatchProgress.WATCHED;
                });
            if (otherWatched && this.episode.bangumi.favorite_status !== Bangumi.WATCHED) {
                this._subscription.add(
                    this.canSync()
                        .flatMap(result => {
                            if (result.canSync) {
                                return this._synchronizeService.updateFavoriteStatus(bangumi, Bangumi.WATCHED)
                                    .do(() => {
                                        this._toastRef.show('已与Bangumi同步');
                                    });
                            }
                            return this._watchService.favorite_bangumi(this.episode.bangumi_id, Bangumi.WATCHED);
                        })
                        .subscribe(() => {
                            this.episode.bangumi.favorite_status = Bangumi.WATCHED;
                            this.homeService.changeFavorite();
                        })
                );
            }
        }
    }

    ngOnInit(): void {
        let searchStr = window.location.search;
        let videoFileId = null;
        if (!!searchStr) {
            let params = new URLSearchParams(searchStr);
            videoFileId = params.get('video_id');
        }
        this._subscription.add(
            this._route.params
                .flatMap((params) => {
                    let episode_id = params['episode_id'];
                    return this.homeService.episode_detail(episode_id)
                })
                .do(episode => {
                    this.homeService.checkFavorite(episode.bangumi_id);
                })
                .flatMap((episode: Episode) => {
                    this.episode = episode;
                    if (videoFileId) {
                        this.currentVideoFile = this.episode.video_files
                            .filter(videoFile => videoFile.status === VideoFile.STATUS_DOWNLOADED)
                            .find(videoFile => videoFile.id === videoFileId);
                    }
                    if (!this.currentVideoFile) {
                        this.currentVideoFile = this.episode.video_files
                            .find(videoFile => videoFile.status === VideoFile.STATUS_DOWNLOADED);
                    }
                    return this.homeService.bangumi_detail(episode.bangumi_id);
                })
                .subscribe(
                    (bangumi: Bangumi) => {
                        this.isBangumiReady = true;
                        this.episode.bangumi = bangumi;
                        let epsTitle = `${this.episode.bangumi.name} ${this.episode.episode_no} - ${SITE_TITLE}`;
                        this._titleService.setTitle(epsTitle);
                        this.nextEpisode = bangumi.episodes.find(e => {
                            return e.episode_no - this.episode.episode_no === 1 && e.status === Episode.STATUS_DOWNLOADED;
                        });
                    },
                    error => console.log(error)
                )
        );

        this._subscription.add(
            this.positionChange
                .throttleTime(5000)
                // .filter(() => {
                //     return !this.isUpdateHistory;
                // })
                .subscribe(
                    (position) => {
                        this.updateHistory(position);
                    },
                    () => {
                    }
                )
        );
        this._subscription.add(
            this._chromeExtensionService.isEnabled
                .filter(enabled => enabled)
                .flatMap(() => {
                    return this._chromeExtensionService.authInfo;
                })
                .filter(authInfo => !!authInfo)
                .flatMap(() => {
                    return this._chromeExtensionService.isBgmTvLogon;
                })
                .filter(isLogon => isLogon === LOGON_STATUS.TRUE)
                .subscribe(() => {
                    this.commentEnabled = true;
                })
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    private canSync(): Observable<any> {
        return this._chromeExtensionService.isEnabled
            .flatMap((isEnabled) => {
                if (!isEnabled) {
                    return Observable.throw({canSync: false});
                }
                return this._chromeExtensionService.authInfo;
            })
            .flatMap((authInfo) => {
                if (!authInfo) {
                    return Observable.throw({canSync: false});
                }
                return this._chromeExtensionService.isBgmTvLogon;
            })
            .flatMap((isBgmLogon) => {
                if (isBgmLogon !== LOGON_STATUS.TRUE) {
                    return Observable.throw({canSync: false});
                }
                return Observable.of({canSync: true});
            })
            .catch((error) => {
                return Observable.of(error);
            });
    }
}
