import {
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  template: `
    <img #img alt="img" />
    <br />
    <button (click)="incrementId()">Load Next</button>
    <button (click)="decrementId()">Load Prev</button>
  `,
  styles: [],
})
export class AppComponent {
  private readonly appService = inject(AppService);
  public image = viewChild<ElementRef<HTMLImageElement>>('img');

  private readonly effect = effect(() => {
    const res = this.appService.getImage();

    if (res) {
      const url = URL.createObjectURL(res);
      const image = this.image();
      if (image) image.nativeElement.src = url;
    }
  });

  public incrementId(): void {
    this.appService.imgId.update((prev) => prev + 1);
  }

  public decrementId(): void {
    this.appService.imgId.update((prev) => {
      if (prev === 1) return 1;
      return prev - 1;
    });
  }
}
