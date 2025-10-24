import { from, Observable } from "rxjs";
import { ElementCodenames } from "../../_generated/delivery";

export function promiseToObservable<T>(promise: Promise<T>): Observable<T> {
    return from(promise);
}

export const isNotUndefined = <T>(item: T | undefined): item is T => item !== undefined;

export function getElementsProperty<T extends string>(elementCodename: T): string {
    return `elements.${elementCodename}`;
}

export function getImageHeightWhilePreservingAspectRatio({ originalWidth, originalHeight, targetWidth }: { readonly originalWidth: number | null | undefined; readonly originalHeight: number | null | undefined; readonly targetWidth: number }): number {
    if (!originalWidth || !originalHeight) {
        return 0;
    }

    return (targetWidth * originalHeight) / originalWidth;
}

export function formatPriceInCents(price: number): string {
    return `$${price / 100}`;
}