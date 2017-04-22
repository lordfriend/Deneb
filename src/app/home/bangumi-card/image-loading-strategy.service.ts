import {Injectable} from '@angular/core';

@Injectable()
export class ImageLoadingStrategy {
    imageUrl = {};

    hasLoaded(url) {
        return !!this.imageUrl[url];
    }

    addLoadedUrl(url: string) {
        this.imageUrl[url] = true;
    }
}
