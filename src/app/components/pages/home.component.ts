import { Component, computed, inject, signal } from "@angular/core";
import { KontentAiService } from "../../services/kontent-ai.service";
import { LandingPage, Product } from "../../../_generated/delivery";
import { promiseToObservable } from "../../utils/core.utils";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgOptimizedImage } from "@angular/common";
import { AppFlexModule } from "../ui/flex";

type FeaturedProduct = {
    readonly title: string;
    readonly id: string;
    readonly image: {
        readonly url: string;
        readonly width: number;
        readonly height: number;
    };
}

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [NgOptimizedImage, AppFlexModule],
})
export class HomeComponent {
    private readonly kontentAiService = inject(KontentAiService);
    protected readonly landingPage = signal<LandingPage | undefined>(undefined);

    protected readonly heroImage = computed<{ readonly url: string; readonly width: number; readonly height: number } | undefined>(() => {
        const heroImage = this.landingPage()?.elements.hero_image.value?.[0];

        if (!heroImage) {
            return undefined;
        }

        const width = 800;
        const height = 300;

        return {
            url: this.kontentAiService.getImageBuilder(heroImage.url)
                .withAutomaticFormat()
                .withFitMode('crop')
                .withCompression('lossless')
                .withFocalPointCrop(0, 0, 1)
                .withHeight(height)
                .withWidth(width).getUrl(), width, height
        }
    });

    protected readonly bodyCopyHtml = computed<string | undefined>(() => {
        return this.landingPage()?.elements.body_copy.value ?? undefined;
    });

    protected readonly featuredProducts = computed<readonly FeaturedProduct[] | undefined>(() => {
        const featuredProducts = this.landingPage()?.elements.featured_products.linkedItems;

        if (!featuredProducts?.length) {
            return undefined;
        }
        return featuredProducts.map<FeaturedProduct>(m => {
            const widthAndHeight = 130;
            return {
                title: m.elements.product_type.value?.[0]?.name ?? '',
                id: m.system.id,
                image: {
                    url: this.kontentAiService.getImageBuilder(m.elements.images.value?.[0].url)
                        .withAutomaticFormat()
                        .withFitMode('crop')
                        .withCompression('lossless')
                        .withFocalPointCrop(0, 0, 1)
                        .withHeight(widthAndHeight)
                        .withWidth(widthAndHeight).getUrl(), width: widthAndHeight, height: widthAndHeight
                }
            }
        });
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