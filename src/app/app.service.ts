import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, map, Observable, of, switchMap, tap } from 'rxjs';

interface CacheImage {
  id: number;
  blob: Blob;
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly http = inject(HttpClient);

  private _ids = signal<number[]>([]);
  private _cachedImages: CacheImage[] = [];

  public imgId = signal(1);

  private getImage$ = toObservable(this.imgId).pipe(
    tap((iid) => {
      const set = [...new Set([...this._ids(), iid])];
      this._ids.set(
        set.filter((id) => getRangeImagesIds(id, iid)).sort((a, b) => a - b),
      );
      this._cachedImages = this._cachedImages.filter(({ id }) =>
        getRangeImagesIds(id, iid),
      );
    }),
    map((id) => {
      const index = this._cachedImages.findIndex((img) => img.id === id);
      const url = `https://picsum.photos/id/${id}/200/300`;
      console.log(this._cachedImages, this._ids(), this.imgId());

      return { index, url, id };
    }),
    switchMap((val) => {
      const { index, url, id } = val;

      if (index > -1) {
        const image = this._cachedImages[index];
        return of(image.blob);
      }

      return this.http
        .get(url, { responseType: 'blob' })
        .pipe(tap((blob) => this.checkAndCacheImage(id, blob)));
    }),
    catchError(() => {
      console.log('error');
      return EMPTY;
    }),
  );

  public readonly getImage = toSignal(this.getImage$);

  private checkAndCacheImage(id: number, blob: Blob) {
    if (this._ids().indexOf(id) > -1) {
      this._cachedImages.push({ id, blob });
    }
  }
}

function getRangeImagesIds(id: number, uid: number): boolean {
  return id > uid - 3 && id < uid + 3;
}
