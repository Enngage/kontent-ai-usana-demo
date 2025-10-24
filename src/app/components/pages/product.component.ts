import { Component, computed, resource, signal } from "@angular/core";
import { CoreComponent } from "../core/core.component";
import { NgOptimizedImage } from "@angular/common";
import { AppFlexModule } from "../ui/flex/flex.module";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppImage } from "../../models/core.models";
import { BodyBenefitsTaxonomyTermCodenames, Product as KontentProduct } from "../../../_generated/delivery";
import { formatPriceInCents, getImageHeightWhilePreservingAspectRatio } from "../../utils/core.utils";
import { RouterLink } from "@angular/router";

export function getProductUrl(codename: string): string {
    return `/product/${codename}`;
}

type BodyBenefit = {
    readonly name: string;
    readonly icon: string;
}

type BaseProductInfo = {
    readonly categories: readonly string[];
    readonly title: string;
    readonly descriptionHtml: string;
    readonly image: AppImage | undefined;
    readonly commerceToolsId: string | undefined;
    readonly bodyBenefits: readonly BodyBenefit[];
}

type SKUInfo = {
    readonly skuId: string;
    readonly price: string;
    readonly inStockCount: number;
    readonly description: string;
}

@Component({
    selector: 'product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    imports: [NgOptimizedImage, AppFlexModule, RouterLink],
})
export class ProductComponent extends CoreComponent {

    private readonly currentCodename = signal<string | undefined>(undefined);

    protected readonly kontentProduct = resource<BaseProductInfo | undefined | 'n/a', { readonly codename: string | undefined }>({
        params: () => ({ codename: this.currentCodename() }),
        loader: ({ params: { codename } }) => this.getKontentProduct(codename),
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

    private getKontentProduct(codename: string | undefined): Promise<BaseProductInfo | undefined | 'n/a'> {
        if (!codename) {
            return Promise.resolve(undefined);
        }

        return this.kontentAiService.deliveryClient.item<KontentProduct>(codename).toPromise().then(response => {
            const item = response.data.item;

            const image = item.elements.images.value?.[0];

            if (!image) {
                return 'n/a';
            }

            const width = 300;
            const height = getImageHeightWhilePreservingAspectRatio({ originalWidth: image.width, originalHeight: image.height, targetWidth: width });

            const productInfo: BaseProductInfo = {
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