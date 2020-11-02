import { Observables, WatchObservable } from 'vue-rx';
import { WatchOptions } from 'vue';
import { Observable } from 'rxjs';

declare module 'vue/types/vue' {
  interface Vue {
    $observables: Observables;
    $watchAsObservable<T>(
      expr: string,
      options?: WatchOptions
    ): Observable<WatchObservable<T>>;
    $watchAsObservable<T>(
      fn: (this: this) => T,
      options?: WatchOptions
    ): Observable<WatchObservable<T>>;
    $eventToObservable<T>(event: string): Observable<{ name: string; msg: T }>;
    $subscribeTo<T>(
      observable: Observable<T>,
      next: (t: T) => void,
      error?: (e: Error) => void,
      complete?: () => void
    ): void;
    $fromDOMEvent(selector: string | null, event: string): Observable<Event>;
    $createObservableMethod<T>(methodName: string): Observable<T>;
  }
}
