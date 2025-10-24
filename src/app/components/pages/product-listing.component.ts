import { Component, inject, resource, signal } from "@angular/core";
import { AppFlexModule } from "../ui/flex/flex.module";
import { UiButtonComponent } from "../ui/ui-button.component";
import { NgOptimizedImage } from "@angular/common";
import { CoreComponent } from "../core/core.component";
import { isProductTypeTaxonomyTermCodename, LandingPage, Page, PageElementCodenames, Product, ProductElementCodenames, ProductTypeTaxonomyTermCodenames } from "../../../_generated/delivery";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { getElementsProperty, getImageHeightWhilePreservingAspectRatio, isNotUndefined, promiseToObservable } from "../../utils/core.utils";
import { AppImage } from "../../models/core.models";
import { getProductUrl } from "./product.component";

export function getProductListingUrl(categoryCodename: ProductTypeTaxonomyTermCodenames): string {
    return `/listing/${categoryCodename}`;
}

type ProductCategory = {
    readonly name: string;
    readonly codename: ProductTypeTaxonomyTermCodenames;
    readonly url: string;
}

type ProductIntro = {
    readonly title: string;
    readonly descriptionHtml: string;
    readonly image: AppImage | undefined;
}

type ProductItem = {
    readonly title: string;
    readonly id: string;
    readonly image: AppImage;
    readonly url: string;
}

@Component({
    selector: 'product-listing',
    templateUrl: './product-listing.component.html',
    styleUrls: ['./product-listing.component.scss'],
    imports: [NgOptimizedImage, AppFlexModule, UiButtonComponent, RouterLink],
})
export class ProductListingComponent extends CoreComponent {
    protected readonly currentProductTypeCodename = signal<ProductTypeTaxonomyTermCodenames | undefined>(undefined);
    protected readonly productCategories = signal<ProductCategory[] | undefined>(undefined);

    protected readonly productIntro = resource<ProductIntro | undefined | 'n/a', { readonly categoryCodename: ProductTypeTaxonomyTermCodenames | undefined }>({
        params: () => ({ categoryCodename: this.currentProductTypeCodename() }),
        loader: ({ params: { categoryCodename } }) => this.getProductIntro(categoryCodename),
    });

    protected readonly products = resource<readonly ProductItem[] | undefined, { readonly categoryCodename: ProductTypeTaxonomyTermCodenames | undefined }>({
        params: () => ({ categoryCodename: this.currentProductTypeCodename() }),
        loader: ({ params: { categoryCodename } }) => this.getProducts(categoryCodename),
    });

    constructor() {
        super();

        this.subscribeToRouteParams();
        this.loadProductCategories();
    }

    private subscribeToRouteParams(): void {
        this.route.params
            .pipe(
                takeUntilDestroyed()
            ).subscribe((params) => {
                const codename: string = params['codename'];

                if (isProductTypeTaxonomyTermCodename(codename)) {
                    this.currentProductTypeCodename.set(codename);
                }
            });
    }

    private loadProductCategories(): void {
        promiseToObservable(this.kontentAiService.deliveryClient.taxonomy('product_type').toPromise())
            .pipe(
                takeUntilDestroyed(),
            )
            .subscribe((response) => {
                this.productCategories.set(response.data.taxonomy.terms.map<ProductCategory | undefined>(m => {
                    if (isProductTypeTaxonomyTermCodename(m.codename)) {
                        return {
                            name: m.name,
                            codename: m.codename,
                            url: getProductListingUrl(m.codename),
                        }
                    }
                    return undefined;
                }).filter(isNotUndefined))


            });
    }

    private getProducts(productTypeCodename: ProductTypeTaxonomyTermCodenames | undefined): Promise<readonly ProductItem[] | undefined> {
        if (!productTypeCodename) {
            return Promise.resolve(undefined);
        }

        return this.kontentAiService.deliveryClient.items<Product>().limitParameter(10).type('product').anyFilter(getElementsProperty<ProductElementCodenames>('product_type'), [productTypeCodename]).toPromise().then(response => {
            return response.data.items?.map<ProductItem | undefined>(m => {
                const image = m.elements.images.value?.[0];
                if (!image) {
                    return undefined;
                }

                const widthAndHeight = 250;

                return {
                    title: m.elements.name.value,
                    id: m.system.id,
                    url: getProductUrl(m.system.codename),
                    image: {
                        url: this.kontentAiService.getImageBuilder(image.url)
                            .withFocalPointCrop(0.5, 0.5, 1)
                            .withHeight(widthAndHeight)
                            .withWidth(widthAndHeight).getUrl(),
                        width: widthAndHeight,
                        height: widthAndHeight
                    }
                }
            }).filter(isNotUndefined)
        });
    }

    private getProductIntro(productTypeCodename: ProductTypeTaxonomyTermCodenames | undefined): Promise<ProductIntro | undefined | 'n/a'> {
        if (!productTypeCodename) {
            return Promise.resolve(undefined);
        }

        return this.kontentAiService.deliveryClient.items<Page>().limitParameter(1).type('page').anyFilter(getElementsProperty<PageElementCodenames>('category'), [productTypeCodename]).toPromise().then(response => {
            const page = response.data.items?.[0];

            if (!page) {
                return 'n/a';
            }

            const image = page.elements.hero_image.value?.[0];

            if (!image) {
                return {
                    title: page.elements.title.value,
                    descriptionHtml: page.elements.body_copy.value,
                    image: undefined,
                };
            }

            const width = 800;
            const height = getImageHeightWhilePreservingAspectRatio({ originalWidth: image.width, originalHeight: image.height, targetWidth: width });

            return {
                title: page.elements.title.value,
                descriptionHtml: page.elements.body_copy.value,
                image: {
                    url: this.kontentAiService.getImageBuilder(page.elements.hero_image.value?.[0].url)
                        .withHeight(height)
                        .withWidth(width).getUrl(), width, height
                }
            };
        })

    }


}   