export class VideoPlayerHelpers {
    static isiOSDevice(): boolean {
        return true;
    }

    static isMobileDevice(): boolean {
        return true;
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
