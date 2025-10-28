import { Injectable, signal } from "@angular/core";
import { createDeliveryClient, ImageUrlTransformationBuilder } from "@kontent-ai/delivery-sdk";
import { CoreDeliveryClient } from "../../_generated/delivery";
import { environment } from "../../environments/environment";
import { jsCookieHelper } from "../utils/js-cookie-helper.class";

type KontentAiClients = {
    readonly published: CoreDeliveryClient;
    readonly preview: CoreDeliveryClient;
}

@Injectable({
    providedIn: 'root'
})
export class KontentAiService {
    public readonly isPreview = signal<boolean>(jsCookieHelper.getCookie('is_preview') === 'true');
    private readonly clients: KontentAiClients = {
        published: createDeliveryClient({
            environmentId: environment.kontent.environmentId,
            previewApiKey: environment.kontent.previewApiKey,
            defaultQueryConfig: {
                usePreviewMode: false,
            }
        }),
        preview: createDeliveryClient({
            environmentId: environment.kontent.environmentId,
            previewApiKey: environment.kontent.previewApiKey,
            defaultQueryConfig: {
                usePreviewMode: true,
            }
        })
    }

    getClient(usePreview: boolean): CoreDeliveryClient {
        if (usePreview) {
            return this.clients.preview;
        }
        return this.clients.published;
    }

    getImageBuilder(url: string): ImageUrlTransformationBuilder {
        return new ImageUrlTransformationBuilder(url);
    }

}