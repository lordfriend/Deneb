import { ComponentRef, EmbeddedViewRef } from '@angular/core';

export const CONTROL_FADE_OUT_TIME = 3000;

export class VideoPlayerHelpers {
    static isiOSDevice(): boolean {
        return (navigator.userAgent.match(/ip(hone|ad|od)/i) && !navigator.userAgent.match(/(iemobile)[\/\s]?([\w\.]*)/i));
    }

    static isMobileDevice(): boolean {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf("IEMobile") !== -1);
    }

    static calcSliderRatio(rect: ClientRect, x: number): number {
        let offsetX = 0;
        if (x < rect.left) {
            offsetX = 0;
        } else if (x > rect.right) {
            offsetX = rect.width;
        } else {
            offsetX = x - rect.left;
        }
        return offsetX / rect.width;
    }

    static getExtname(url: string) {
        let parts = url.split('.');
        return parts[parts.length - 1];
    }


    static convertTime(timeInSeconds: number): string {
        let hours = Math.floor(timeInSeconds / 3600);
        let minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
        let seconds = Math.floor(timeInSeconds - hours * 3600 - minutes * 60);
        let mm, ss;
        if (minutes < 10) {
            mm = '0' + minutes;
        } else {
            mm = '' + minutes;
        }
        if (seconds < 10) {
            ss = '0' + seconds;
        } else {
            ss = '' + seconds;
        }
        if (hours > 0) {
            return `${hours}:${mm}:${ss}`;
        }
        return `${mm}:${ss}`;
    }

    static isPortrait(): boolean {
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        if (viewportHeight > 0 && viewportWidth > 0) {
            return viewportWidth <= 0.625 * viewportHeight;
        }
        return false;
    }
}


/** Gets the root HTMLElement for an instantiated component. */
export function getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
}
