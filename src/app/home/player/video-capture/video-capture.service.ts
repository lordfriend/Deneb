
export class VideoCaptureService {
  capture(videoElement: HTMLVideoElement) {
    let canvas = document.createElement('canvas');
    canvas.width = videoElement.width;
    canvas.height = videoElement.height;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
  }
}
