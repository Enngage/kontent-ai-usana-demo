import { Component, computed, effect, inject, signal } from "@angular/core";
import { KontentAiService } from "../../services/kontent-ai.service";
import { LandingPage } from "../../../_generated/delivery";
import { promiseToObservable } from "../../utils/core.utils";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgOptimizedImage } from "@angular/common";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    imports: [NgOptimizedImage],
})
export class HomeComponent {
    private readonly kontentAiService = inject(KontentAiService);
    protected readonly landingPage = signal<LandingPage | undefined>(undefined);

    protected readonly heroImage = computed<{ readonly url: string; readonly width: number; readonly height: number } | undefined>(() => {
        const heroImage = this.landingPage()?.elements.hero_image.value?.[0];
        return heroImage ? { url: heroImage.url, width: heroImage.width ?? 0, height: heroImage.height ?? 0 } : undefined;
    });

    constructor() {
        promiseToObservable(this.kontentAiService.deliveryClient.items<LandingPage>().limitParameter(1).type('landing_page').toPromise())
            .pipe(
                takeUntilDestroyed(),
            )
            .subscribe((response) => {
                this.landingPage.set(response.data.items?.[0]);
            });
    }
}