
export class VideoCaptureService {
  capture(videoElement: HTMLVideoElement) {
    let canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    return canvas.toDataURL('img/png');
  }
}
