import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ScrollPositionService {
    private scrollPositions = new Map<string, number>();

    scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    /**
     * Save the current scroll position with a key
     */
    saveScrollPosition(key: string, element?: Element): void {
        const scrollTop = element
            ? element.scrollTop
            : window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop === 0) {
            return;
        }
        this.scrollPositions.set(key, scrollTop);
    }

    /**
     * Restore a saved scroll position
     */
    restoreScrollPosition(key: string, element?: Element, smooth: boolean = false): void {
        const scrollTop = this.scrollPositions.get(key);

        if (scrollTop !== undefined) {
            if (element) {
                element.scrollTo({
                    top: scrollTop,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            } else {
                window.scrollTo({
                    top: scrollTop,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }
        }
    }

}

