import { AfterViewInit, Component, ElementRef, OnDestroy, Self } from '@angular/core';
import { VideoPlayer } from '../video-player.component';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export const CONTROL_FADE_OUT_TIME = 3000;

@Component({
    selector: 'video-controls',
    templateUrl: './controls.html',
    styleUrls: ['./controls.less']
})
export class VideoControls implements OnDestroy, AfterViewInit {
    private _subscription = new Subscription();
    private _motion = new Subject();

    showControls = true;

    constructor(@Self() private _hostRef: ElementRef) {
    }

    onClickVideo(event: Event) {
        event.preventDefault();
        event.stopPropagation();

    }

    onMotion() {
        this._motion.next(1);
    }

    onControlBarClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }

    ngAfterViewInit(): void {
        let hosteElement = this._hostRef.nativeElement;
        this._subscription.add(
            Observable.fromEvent(hosteElement, 'mousedown')
                .subscribe((event: MouseEvent) => event.preventDefault())
        );
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
            this._motion.asObservable()
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
