export const PREFIX = 'VideoPlayer';

export class Capture {
    static className = 'Capture';
    static prefix = `${PREFIX}:${Capture.className}`;
    static AUTO_REMOVE = `${Capture.prefix}:AutoRemove`;
    static DIRECT_DOWNLOAD = `${Capture.prefix}:DirectDownload`;
}
