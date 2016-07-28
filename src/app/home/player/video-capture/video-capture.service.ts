
export class VideoCaptureService {

  imageFormat: string = 'png';

  downloadSupport: boolean;

  constructor() {
    let testAnchor = document.createElement('a');
    this.downloadSupport = typeof testAnchor['download'] !== 'undefined';
  }

  /**
   * capture an draw without return.
   * current buggy in safari https://bugs.webkit.org/show_bug.cgi?id=153588
   * @param videoElement
   * @param canvas
     */
  captureOnCanvas(videoElement: HTMLVideoElement, canvas: HTMLCanvasElement): void {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
  }

  capture(videoElement: HTMLVideoElement): string {
    let canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    return canvas.toDataURL(`image/${this.imageFormat}`);
  }

  download(videoElement: HTMLVideoElement, bangumi_name: string, episode_no: number, currentPlayTime: number): void {
    let url = this.capture(videoElement);
    let hiddenAnchor = document.createElement('a');
    let filename = `${bangumi_name}_${episode_no}_${Math.round(currentPlayTime)}.${this.imageFormat}`;
    hiddenAnchor.setAttribute('download', filename);
    hiddenAnchor.setAttribute('href', url.replace(/^data:image\/[^;]]/, 'data:application/octet-stream'));
    let clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: false
    });
    hiddenAnchor.dispatchEvent(clickEvent);
  }
}
