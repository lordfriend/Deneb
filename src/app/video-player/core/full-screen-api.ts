import { VideoPlayerHelpers } from './helpers';
import { Observable } from 'rxjs/Observable';
import { EventEmitter } from '@angular/core';
export const BROWSER_FULLSCREEN_API = {
    w3: {
        enabled: 'fullscreenEnabled',
        element: 'fullscreenElement',
        request: 'requestFullscreen',
        exit: 'exitFullscreen',
        onchange: 'fullscreenchange',
        onerror: 'fullscreenerror'
    },
    newWebkit: {
        enabled: 'webkitFullscreenEnabled',
        element: 'webkitFullscreenElement',
        request: 'webkitRequestFullscreen',
        exit: 'webkitExitFullscreen',
        onchange: 'webkitfullscreenchange',
        onerror: 'webkitfullscreenerror'
    },
    oldWebkit: {
        enabled: 'webkitIsFullScreen',
        element: 'webkitCurrentFullScreenElement',
        request: 'webkitRequestFullScreen',
        exit: 'webkitCancelFullScreen',
        onchange: 'webkitfullscreenchange',
        onerror: 'webkitfullscreenerror'
    },
    moz: {
        enabled: 'mozFullScreen',
        element: 'mozFullScreenElement',
        request: 'mozRequestFullScreen',
        exit: 'mozCancelFullScreen',
        onchange: 'mozfullscreenchange',
        onerror: 'mozfullscreenerror'
    },
    ios: {
        enabled: 'webkitFullscreenEnabled',
        element: 'webkitFullscreenElement',
        request: 'webkitEnterFullscreen',
        exit: 'webkitExitFullscreen',
        onchange: 'webkitendfullscreen', // Hack for iOS: webkitfullscreenchange it's not firing
        onerror: 'webkitfullscreenerror'
    },
    ms: {
        enabled: 'msFullscreenEnabled',
        element: 'msFullscreenElement',
        request: 'msRequestFullscreen',
        exit: 'msExitFullscreen',
        onchange: 'MSFullscreenChange',
        onerror: 'MSFullscreenError'
    }
};

export class FullScreenAPI {
    polyfill: any;
    isAvailable: boolean;
    isFullscreen: boolean;
    nativeFullscreen = true;
    onChangeFullscreen = new EventEmitter<boolean>();

    constructor(private _mediaElement: HTMLMediaElement, private _hostElement: Element) {
        for (let browser in BROWSER_FULLSCREEN_API) {
            if (BROWSER_FULLSCREEN_API[ browser ].enabled in document) {
                this.polyfill = BROWSER_FULLSCREEN_API[ browser ];
                break;
            }
        }

        if (VideoPlayerHelpers.isiOSDevice()) {
            this.polyfill = BROWSER_FULLSCREEN_API.ios
        }

        let fsElemDispatcher;

        switch (this.polyfill.onchange) {
            // Mozilla dispatches the fullscreen change event from document, not the element
            // See: https://bugzilla.mozilla.org/show_bug.cgi?id=724816#c3
            case 'mozfullscreenchange':
                fsElemDispatcher = document;
                break;

            // iOS dispatches the fullscreen change event from video element
            case 'webkitendfullscreen':
                fsElemDispatcher = _mediaElement;
                break;

            // HTML5 implementation dispatches the fullscreen change event from the element
            default:
                fsElemDispatcher = _hostElement;
        }

        Observable.fromEvent(fsElemDispatcher, this.polyfill.onchange).subscribe(() => {
            this.isFullscreen = !!document[ this.polyfill.element ];
            this.onChangeFullscreen.next(this.isFullscreen);
        });

        this.isAvailable = (this.polyfill != null);
    }

    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exit();
        }
        else {
            this.request();
        }
    }

    request() {
        this.isFullscreen = true;
        this.onChangeFullscreen.next(true);

        // Perform native full screen support
        if (this.isAvailable && this.nativeFullscreen) {
            // Fullscreen for mobile devices
            if (VideoPlayerHelpers.isMobileDevice() && VideoPlayerHelpers.isiOSDevice()) {
                this.enterElementInFullScreen(this._mediaElement);
            }
            else {
                this.enterElementInFullScreen(this._hostElement);
            }
        }
    }

    enterElementInFullScreen(elem: any) {
        elem[ this.polyfill.request ]();
    }


    exit() {
        this.isFullscreen = false;
        this.onChangeFullscreen.next(false);

        // Exit from native fullscreen
        if (this.isAvailable && this.nativeFullscreen) {
            document[ this.polyfill.exit ]();
        }
    }
}
