import { from, Observable } from "rxjs";

export function promiseToObservable<T>(promise: Promise<T>): Observable<T> {
    return from(promise);
}