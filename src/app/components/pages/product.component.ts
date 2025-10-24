import { Component, resource, signal } from "@angular/core";
import { CoreComponent } from "../core/core.component";
import { NgOptimizedImage } from "@angular/common";
import { AppFlexModule } from "../ui/flex/flex.module";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppImage } from "../../models/core.models";
import { Product } from "../../../_generated/delivery";
import { getImageHeightWhilePreservingAspectRatio } from "../../utils/core.utils";

export function getProductUrl(codename: string): string {
    return `/product/${codename}`;
}

type ProductInfo = {
    readonly title: string;
    readonly descriptionHtml: string;
    readonly image: AppImage | undefined;
}

@Component({
    selector: 'product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    imports: [NgOptimizedImage, AppFlexModule],
})
export class ProductComponent extends CoreComponent {

    private readonly currentCodename = signal<string | undefined>(undefined);

    protected readonly product = resource<ProductInfo | undefined | 'n/a', { readonly codename: string | undefined }>({
        params: () => ({ codename: this.currentCodename() }),
        loader: ({ params: { codename } }) => this.getProduct(codename),
    });

    constructor() {
        super();

        this.subscribeToRouteParams();
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

    private getProduct(codename: string | undefined): Promise<ProductInfo | undefined | 'n/a'> {
        if (!codename) {
            return Promise.resolve(undefined);
        }

        return this.kontentAiService.deliveryClient.item<Product>(codename).toPromise().then(response => {
            const item = response.data.item;
            const image = item?.elements.images.value?.[0];

            if (!image) {
                return 'n/a';
            }

            const width = 300;
            const height = getImageHeightWhilePreservingAspectRatio({ originalWidth: image.width, originalHeight: image.height, targetWidth: width });

            const productInfo: ProductInfo = {
                title: item.elements.name.value,
                descriptionHtml: item.elements.more_information.value,
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
}   