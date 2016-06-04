import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {

  /**
   * transform seconds into HH:mm:ss format, the format padding is referenced by duration
   * @param value
   * @param duration
   * @returns {any}
     */
  transform(value:any, duration?: number):any {
    if(Number.isNaN(value)) {
      return '';
    }
    duration = duration ? duration : 0;
    let minute = this.getMinute(value);
    let hour = 0;
    if(minute > 60) {
      hour = this.getHour(minute);
    }
    let second = Math.floor(value - (hour * 60 + minute) * 60);

    return (this.paddingHour(duration) ? (hour > 0 ? hour : '0') + ':' : '') + this.padLeft(minute) + ':' + this.padLeft(second);
  }

  private getMinute(secondsValue:number): number {
    return Math.floor(secondsValue / 60);
  }

  private getHour(minuteValue: number) : number {
    return Math.floor(minuteValue / 60);
  }

  private padLeft(value): string {
    return value < 10 ? '0' + value : value + '';
  }

  private paddingHour(duration: number): boolean {
    return duration >= 3600;
  }
}
