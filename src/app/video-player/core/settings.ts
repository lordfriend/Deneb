export const PREFIX = 'VideoPlayer';

export class Capture {
    static className = 'Capture';
    static prefix = `${PREFIX}:${Capture.className}`;
    static AUTO_REMOVE = `${Capture.prefix}:AutoRemove`;
    static DIRECT_DOWNLOAD = `${Capture.prefix}:DirectDownload`;
}

export class PlayList {
    static className = 'PlayList';
    static prefix = `${PREFIX}:${PlayList.className}`;
    static AUTO_PLAY_NEXT = `${PlayList.prefix}:AutoPlayNext`;
}
