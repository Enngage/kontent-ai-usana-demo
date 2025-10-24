import { Injectable } from "@angular/core";
import {
    ClientBuilder,

    // Import middlewares
    type AuthMiddlewareOptions, // Required for auth
    type HttpMiddlewareOptions, // Required for sending HTTP requests
} from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient, Product } from '@commercetools/platform-sdk';
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class CommerceToolsService {

    private readonly authMiddlewareOptions: AuthMiddlewareOptions = {
        host: environment.commerceTools.authUrl,
        projectKey: environment.commerceTools.projectKey,
        credentials: {
            clientId: environment.commerceTools.clientId,
            clientSecret: environment.commerceTools.clientSecret,
        },
        scopes: environment.commerceTools.scopes,
        httpClient: fetch,
    };

    private readonly httpAPIHTTPMiddlewareOptions: HttpMiddlewareOptions = {
        host: environment.commerceTools.apiUrl,
        httpClient: fetch,
    };

    private readonly apiClient = new ClientBuilder()
        .withProjectKey(environment.commerceTools.projectKey)
        .withClientCredentialsFlow(this.authMiddlewareOptions)
        .withHttpMiddleware(this.httpAPIHTTPMiddlewareOptions)
        .withLoggerMiddleware()
        .build();

    private readonly apiRoot = createApiBuilderFromCtpClient(this.apiClient)
        .withProjectKey({ projectKey: environment.commerceTools.projectKey });

    constructor() {

    }

    async getProductById(id: string): Promise<Product> {
        const response = await this.apiRoot
            .products()
            .withId({ ID: id })
            .get()
            .execute();
        
        return response.body;
    }

}


