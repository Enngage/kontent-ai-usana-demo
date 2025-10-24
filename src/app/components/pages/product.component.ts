import { Component, computed, resource, signal } from "@angular/core";
import { CoreComponent } from "../core/core.component";
import { NgOptimizedImage } from "@angular/common";
import { AppFlexModule } from "../ui/flex/flex.module";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppImage } from "../../models/core.models";
import { BodyBenefitsTaxonomyTermCodenames, Product as KontentProduct, ProductTypeTaxonomyTermCodenames } from "../../../_generated/delivery";
import { formatPriceInCents, getImageHeightWhilePreservingAspectRatio, isNotUndefined } from "../../utils/core.utils";
import { RouterLink } from "@angular/router";
import { getProductListingUrl } from "./product-listing.component";

export function getProductUrl(codename: string): string {
    return `/product/${codename}`;
}

type BodyBenefit = {
    readonly name: string;
    readonly icon: string;
}

type Section = {
    readonly title: string;
    readonly html: string;
}

type BaseProductInfo = {
    readonly categoryCodename: ProductTypeTaxonomyTermCodenames;
    readonly categories: readonly string[];
    readonly title: string;
    readonly descriptionHtml: string;
    readonly image: AppImage | undefined;
    readonly commerceToolsId: string | undefined;
    readonly bodyBenefits: readonly BodyBenefit[];
    readonly sections: readonly Section[];
    readonly recommendedProducts: readonly RecommendedProduct[];
}

type SKUInfo = {
    readonly skuId: string;
    readonly price: string;
    readonly inStockCount: number;
    readonly description: string;
}

type RecommendedProduct = {
    readonly name: string;
    readonly image: AppImage;
    readonly url: string;
}

@Component({
    selector: 'product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    imports: [NgOptimizedImage, AppFlexModule, RouterLink],
})
export class ProductComponent extends CoreComponent {

    private readonly currentCodename = signal<string | undefined>(undefined);

    protected readonly currentCategoryUrl = computed(() => {
        const kontentProduct = this.kontentProduct.value();
        if (!kontentProduct || kontentProduct === 'n/a') {
            return undefined;
        }
        return getProductListingUrl(kontentProduct.categoryCodename);
    });

    protected readonly kontentProduct = resource<BaseProductInfo | undefined | 'n/a', { readonly codename: string | undefined, readonly usePreview: boolean }>({
        params: () => ({ codename: this.currentCodename(), usePreview: this.isPreview() }),
        loader: ({ params: { codename, usePreview } }) => this.getKontentProduct(codename, usePreview),
    });

    protected readonly commerceToolsProduct = resource<SKUInfo | undefined, { readonly id: string | undefined }>({
        params: () => {
            const kontentProduct = this.kontentProduct.value();

            if (!kontentProduct || kontentProduct === 'n/a') {
                return { id: undefined };
            }

            return { id: kontentProduct.commerceToolsId };
        },
        loader: ({ params: { id } }) => this.getCommerceToolsProduct(id),
    });

    constructor() {
        super();

        this.subscribeToRouteParams();
    }

    private extractCommerceToolsId(kontentProduct: KontentProduct): string | undefined {
        try {
            const value = JSON.parse(kontentProduct.elements.product_catalog.value) as ({ readonly id: string | undefined }[]);
            return value?.[0]?.id;
        } catch (error) {
            console.error('Failed to extract CommerceTools ID from Kontent product', error);
            return undefined;
        }
    }

    private subscribeToRouteParams(): void {
        this.route.params
            .pipe(
                takeUntilDestroyed()
            ).subscribe((params) => {
                const codename: string = params['codename'];

                if (codename) {
                    this.currentCodename.set(codename);
                }
            });
    }

    private getKontentProduct(codename: string | undefined, usePreview: boolean): Promise<BaseProductInfo | undefined | 'n/a'> {
        if (!codename) {
            return Promise.resolve(undefined);
        }

        return this.kontentAiService.getClient(usePreview).item<KontentProduct>(codename).toPromise().then(response => {
            const item = response.data.item;
            const image = item.elements.images.value?.[0];

            if (!image) {
                return 'n/a';
            }

            const width = 300;
            const height = getImageHeightWhilePreservingAspectRatio({ originalWidth: image.width, originalHeight: image.height, targetWidth: width });

            const productInfo: BaseProductInfo = {
                categoryCodename: item.elements.product_type.value?.[0]?.codename,
                recommendedProducts: this.getRecommendedProducts(item),
                sections: [
                    { title: 'More Information', html: item.elements.more_information.value },
                    { title: 'About the Product', html: item.elements.about_the_product.value },
                    { title: 'How to Use & what to expect', html: item.elements.how_to_use.value },
                    { title: 'Our Formula', html: item.elements.our_formula.value },
                    ...this.getQualityAssuranceSections(item),
                ],
                categories: item.elements.product_type.value.map(m => m.name),
                title: item.elements.name.value,
                descriptionHtml: item.elements.more_information.value,
                commerceToolsId: this.extractCommerceToolsId(item),
                bodyBenefits: item.elements.body_benefits.value.map(m => ({ name: m.name, icon: this.getBodyBenefitIcon(m.codename) })),
                image: {
                    url: this.kontentAiService.getImageBuilder(image.url)
                        .withHeight(height)
                        .withWidth(width).getUrl(), width, height
                },
            };

            return productInfo;

        }).catch<'n/a'>(error => {
            console.error(error);
            return 'n/a';
        });
    }

    private getRecommendedProducts(item: KontentProduct): readonly RecommendedProduct[] {
        const recommendedProducts = item.elements.recommended_products.linkedItems;

        if (!recommendedProducts) {
            return [];
        }
        return recommendedProducts.map<RecommendedProduct | undefined>(m => {
            const image = m.elements.images.value?.[0];
            if (!image) {
                return undefined;
            }

            const width = 200;
            const height = getImageHeightWhilePreservingAspectRatio({ originalWidth: image.width, originalHeight: image.height, targetWidth: width });

            return {
                name: m.elements.name.value,
                image: {
                    url: this.kontentAiService.getImageBuilder(image.url)
                        .withFocalPointCrop(0.5, 0.5, 1)
                        .withHeight(height)
                        .withWidth(width).getUrl(),
                    width,
                    height,
                },
                url: getProductUrl(m.system.codename),
            };
        }).filter(isNotUndefined);

    }

    private getQualityAssuranceSections(item: KontentProduct): readonly Section[] {
        const qualityAssurance = item.elements.quality_assurance.linkedItems?.[0];


        if (!qualityAssurance) {
            return [];
        }

        return [
            {
                title: qualityAssurance.elements.header.value,
                html: qualityAssurance.elements.body_copy.value,
            },
        ]
    }

    private getBodyBenefitIcon(bodyBenefit: BodyBenefitsTaxonomyTermCodenames): string {
        switch (bodyBenefit) {
            case 'heart_health':
                return '🏥';
            case 'joint_health':
                return '💪';
            case 'brain_health':
                return '🧠';
            case 'immune_health':
                return '🛡️';
            case 'digestive_health':
                return '🍏';
            case 'healthy_energy':
                return '🔋';
            case 'skin_health':
                return '🌟';
        }
    }

    private getCommerceToolsProduct(id: string | undefined): Promise<SKUInfo | undefined> {
        if (!id) {
            return Promise.resolve(undefined);
        }

        return this.commerceToolsService.getProductById(id).then(response => {
            const channels = response.masterData.current.masterVariant.availability?.channels;
            const channel = Object.entries(channels ?? {})?.[0];
            const description = Object.entries(response.masterData.current.description ?? {})?.[0]?.[1] ?? '';

            const skuInfo: SKUInfo = {
                description: description,
                skuId: response.key ?? '',
                price: formatPriceInCents(response.masterData.current.masterVariant.prices?.[0]?.value?.centAmount ?? 0),
                inStockCount: channel?.[1]?.availableQuantity ?? 0,
            };

            return skuInfo;
        }).catch(error => {
            console.error('Failed to get CommerceTools product', error);
            return undefined;
        });
    }
}   