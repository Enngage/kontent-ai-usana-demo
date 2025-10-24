import { Component } from "@angular/core";
import { CoreComponent } from "../core/core.component";
import { RouterLink } from "@angular/router";
import { NgOptimizedImage } from "@angular/common";
import { AppFlexModule } from "../ui/flex/flex.module";

export function getProductUrl(codename: string): string {
    return `/product/${codename}`;
}

@Component({
    selector: 'product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    imports: [NgOptimizedImage, AppFlexModule],
})
export class ProductComponent extends CoreComponent { }   