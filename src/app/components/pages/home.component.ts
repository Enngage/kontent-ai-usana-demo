import { Component, computed, inject, signal } from "@angular/core";
import { KontentAiService } from "../../services/kontent-ai.service";
import { LandingPage, Product } from "../../../_generated/delivery";
import { promiseToObservable } from "../../utils/core.utils";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgOptimizedImage } from "@angular/common";
import { AppFlexModule } from "../ui/flex";
import { AppImage } from "../../models/core.models";
import { UiButtonComponent } from "../ui/ui-button.component";
import { CoreComponent } from "../core/core.component";
import { getProductListingUrl } from "./product-listing.component";
import { RouterLink } from "@angular/router";
import { getProductUrl } from "./product.component";

type FeaturedProduct = {
    readonly title: string;
    readonly description: string;
    readonly id: string;
    readonly image: Omit<AppImage, 'height' | 'width'>;
    readonly url: string;
}

type HomeCTA = {
    readonly title: string;
    readonly image: AppImage
    readonly textHtml: string;
    readonly buttonText: string;
}

type ProductListingItem = {
    readonly title: string;
    readonly id: string;
    readonly image: AppImage;
    readonly url: string | undefined;
}

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [NgOptimizedImage, AppFlexModule, UiButtonComponent, RouterLink],
})
export class HomeComponent extends CoreComponent {
    private readonly maxFeaturedProducts = 2;
    private readonly landingPage = signal<LandingPage | undefined>(undefined);
    protected readonly products = signal<readonly ProductListingItem[] | undefined>(undefined);

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
                .withCompression('lossless')
                .withHeight(height)
                .withWidth(width).getUrl(), width, height
        }
    });

    protected readonly bodyCopyHtml = computed<string | undefined>(() => {
        return this.landingPage()?.elements.body_copy.value ?? undefined;
    });

    protected readonly homeCTA = computed<HomeCTA | undefined>(() => {
        const homeCTA = this.landingPage()?.elements.call_to_action.linkedItems;

        if (!homeCTA?.length) {
            return undefined;
        }

        const image = homeCTA[0].elements.image.value?.[0];

        if (!image) {
            return undefined;
        }

        return {
            title: homeCTA[0].elements.header.value,
            image: {
                url: image.url,
                width: image.width ?? 0,
                height: image.height ?? 0,
            },
            textHtml: homeCTA[0].elements.body_copy.value,
            buttonText: homeCTA[0].elements.button_text.value,
        }
    });


    protected readonly featuredProducts = computed<readonly FeaturedProduct[] | undefined>(() => {
        const featuredProducts = this.landingPage()?.elements.featured_products.linkedItems.slice(0, this.maxFeaturedProducts);

        if (!featuredProducts?.length) {
            return undefined;
        }
        return featuredProducts.map<FeaturedProduct>(m => {
            return {
                title: m.elements.name.value,
                description: m.elements.body_benefits.value.map(m => m.name).join(', '),
                id: m.system.id,
                url: getProductUrl(m.system.codename),
                image: {
                    url: this.kontentAiService.getImageBuilder(m.elements.images.value?.[0].url)
                        .withAutomaticFormat()
                        .withCompression('lossless')
                        .withHeight(500)
                        .getUrl()
                }
            }
        });
    });

    constructor() {
        super();

        this.loadLandingPage();
        this.loadProducts();
    }

    private loadLandingPage(): void {
        promiseToObservable(this.kontentAiService.deliveryClient.items<LandingPage>().limitParameter(1).type('landing_page').toPromise())
            .pipe(
                takeUntilDestroyed(),
            )
            .subscribe((response) => {
                this.landingPage.set(response.data.items?.[0]);
            });
    }

    private loadProducts(): void {
        promiseToObservable(this.kontentAiService.deliveryClient.items<Product>().limitParameter(20).type('product').toPromise())
            .pipe(
                takeUntilDestroyed(),
            )
            .subscribe((response) => {
                this.products.set(response.data.items?.map<ProductListingItem>(m => {
                    const widthAndHeight = 130;
                    const productType = m.elements.product_type.value?.[0];
                    return {
                        title: productType?.name ?? '',
                        id: m.system.id,
                        url: productType?.codename ? getProductListingUrl(productType.codename) : undefined,
                        image: {
                            url: this.kontentAiService.getImageBuilder(m.elements.images.value?.[0].url)
                                .withAutomaticFormat()
                                .withCompression('lossless')
                                .withFocalPointCrop(0, 0, 1)
                                .withHeight(widthAndHeight)
                                .withWidth(widthAndHeight).getUrl(), width: widthAndHeight, height: widthAndHeight
                        }
                    }
                }));
            });
    }
}