export class VideoPlayerHelpers {
    static isiOSDevice(): boolean {
        return (navigator.userAgent.match(/ip(hone|ad|od)/i) && !navigator.userAgent.match(/(iemobile)[\/\s]?([\w\.]*)/i));
    }

    static isMobileDevice(): boolean {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf("IEMobile") !== -1);
    }

    static calcSliderRatio(sliderElement: HTMLElement, event: MouseEvent): number {
        let rect = sliderElement.getBoundingClientRect();
        let offsetX = 0;
        if (event.clientX < rect.left + 1) {
            offsetX = 0;
        } else if (event.clientX > rect.right - 1) {
            offsetX = rect.width;
        } else {
            offsetX = event.clientX - (rect.left + 1);
        }
        return offsetX / (rect.width - 2);
    }

    static getExtname(url: string) {
        let parts = url.split('.');
        return parts[parts.length - 1];
    }
}
