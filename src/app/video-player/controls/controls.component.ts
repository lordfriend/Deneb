import { AfterViewInit, Component, ElementRef, OnDestroy, Self } from '@angular/core';
import { VideoPlayer } from '../video-player.component';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export const CONTROL_FADE_OUT_TIME = 3000;

@Component({
    selector: 'video-controls',
    templateUrl: './controls.html'
})
export class VideoControls implements OnDestroy, AfterViewInit {
    private _subscription = new Subscription();
    private _motions = new Subject<any>();

    showControls = true;

    constructor(@Self() private _hostRef: ElementRef) {
    }

    /**
     * this item is used for any component which trigger a motion can make the controls show or disrupt the fade timeout
     */
    emitMotion(item: any) {
        this._motions.next(item);
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
            Observable.fromEvent(hosteElement, 'mousemove')
                .subscribe(
                    () => {
                        this.emitMotion(1);
                    }
                )
        );

        this._subscription.add(
            this._motions.asObservable()
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
