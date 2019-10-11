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

export class FloatPlayer {
    static className = 'FloatPlayer';
    static prefix = `${PREFIX}:${FloatPlayer.className}`;
    static AUTO_FLOAT_WHEN_SCROLL = `${FloatPlayer.prefix}:AutoFloatWhenScroll`;
    static AUTO_FLOAT_WHEN_LEAVE = `${FloatPlayer.prefix}:AutoFloatWhenLeave`;
}
