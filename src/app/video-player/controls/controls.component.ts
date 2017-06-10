import { AfterViewInit, Component, ElementRef, OnDestroy, Self } from '@angular/core';
import { VideoPlayer } from '../video-player.component';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

export const CONTROL_FADE_OUT_TIME = 3000;

@Component({
    selector: 'video-controls',
    templateUrl: './controls.html'
})
export class VideoControls implements OnDestroy, AfterViewInit {
    private _subscription = new Subscription();

    showControls = true;

    constructor(@Self() private _hostRef: ElementRef,
                private _videoPlayer: VideoPlayer) {
    }

    onClickVideo(event: Event) {
        event.preventDefault();
        event.stopPropagation();

    }

    ngAfterViewInit(): void {
        let hosteElement = this._hostRef.nativeElement;
        this._subscription.add(
            Observable.fromEvent(hosteElement, 'mouseenter')
                .subscribe(
                    () => {
                        this.showControls = true;
                    }
                )
        );
        this._subscription.add(
            Observable.fromEvent(hosteElement, 'mouseleave')
                .subscribe(
                    () => {
                        this.showControls = false;
                    }
                )
        );

        this._subscription.add(
            this._videoPlayer.motion
                .merge(Observable.fromEvent(hosteElement, 'mousemove'))
                .timeout(CONTROL_FADE_OUT_TIME)
                .do(() => {
                    },
                    () => {
                        this.showControls = false;
                    })
                .retry()
                .subscribe(
                    () => {
                        this.showControls = true;
                    }
                )
        );
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
