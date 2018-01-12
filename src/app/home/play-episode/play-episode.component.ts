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

export const MIN_WATCHED_PERCENTAGE = 0.95;


@Component({
    selector: 'play-episode',
    templateUrl: './play-episode.html',
    styleUrls: ['./play-episode.less']
})
export class PlayEpisode extends HomeChild implements OnInit, OnDestroy {
    private routeParamsSubscription: Subscription;
    private positionChangeSubscription: Subscription;

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

    currentVideoFile: VideoFile;

    @ViewChild(VideoPlayer) videoPlayer: VideoPlayer;

    constructor(homeService: HomeService,
                private watchService: WatchService,
                private titleService: Title,
                private route: ActivatedRoute,
                private router: Router) {
        super(homeService);
    }

    onVideoFileChnage(videoFile: VideoFile):void {
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
        if (position === this.duration) {
            this.updateHistory(position);
        }
        this.positionChange.next(position);
        this.updateEpisodeWatchProgress();
    }

    onDurationUpdate(duration: number) {
        this.duration = duration;
    }

    onPlayNext(episodeId: string) {
        this.router.navigateByUrl(`/play/${episodeId}`);
    }

    ngOnInit(): any {
        let searchStr = window.location.search;
        let videoFileId = null;
        if (!!searchStr) {
            let params = new URLSearchParams(searchStr);
            videoFileId = params.get('video_id');
        }
        this.routeParamsSubscription = this.route.params
            .flatMap((params) => {
                let episode_id = params['episode_id'];
                return this.homeService.episode_detail(episode_id)
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
                return this.homeService.bangumi_datail(episode.bangumi_id);
            })
            .subscribe(
                (bangumi: Bangumi) => {
                    this.isBangumiReady = true;
                    this.episode.bangumi = bangumi;
                    let epsTitle = `${this.episode.bangumi.name} ${this.episode.episode_no} - ${SITE_TITLE}`;
                    this.titleService.setTitle(epsTitle);
                    this.nextEpisode = bangumi.episodes.find(e => {
                        return e.episode_no - this.episode.episode_no === 1 && e.status === Episode.STATUS_DOWNLOADED;
                    });
                },
                error => console.log(error)
            );

        this.positionChangeSubscription = this.positionChange
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
            );
        return null;
    }

    updateHistory(position) {
        // this.isUpdateHistory = true;
        let percentage = position / this.duration;
        if (Number.isNaN(percentage)) {
            return;
        }
        this.watchService.updateWatchProgress(this.episode.bangumi_id, this.episode.id, position, percentage, this.isFinished);
        // this.watchService.episode_history(this.episode.bangumi_id, this.episode.id, position, percentage, this.isFinished)
        //     .subscribe(
        //         () => {
        //             this.isUpdateHistory = false;
        //         },
        //         () => {
        //             this.isUpdateHistory = false;
        //         }
        //     );
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
        this.episode.watch_progress.watch_status = this.isFinished ? WatchProgress.WATCHED : WatchProgress.WATCHING;
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
                this.watchService.favorite_bangumi(this.episode.bangumi_id, Bangumi.WATCHED)
                    .subscribe(() => {
                        this.episode.bangumi.favorite_status = Bangumi.WATCHED;
                        this.homeService.changeFavorite();
                    });
            }
        }
    }

    ngOnDestroy(): any {
        this.routeParamsSubscription.unsubscribe();
        this.positionChangeSubscription.unsubscribe();
        return null;
    }
}
