import { Injectable } from "@angular/core";
import { createDeliveryClient, ImageUrlTransformationBuilder } from "@kontent-ai/delivery-sdk";
import { CoreDeliveryClient } from "../../_generated/delivery";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class KontentAiService {

    public readonly deliveryClient: CoreDeliveryClient;
    constructor() {
        this.deliveryClient = createDeliveryClient({
            environmentId: environment.kontent.environmentId,
            previewApiKey: environment.kontent.previewApiKey
        });
    }

    getImageBuilder(url: string): ImageUrlTransformationBuilder {
        return new ImageUrlTransformationBuilder(url);
    }

}