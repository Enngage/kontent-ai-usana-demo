import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home.component';
import { ProductComponent } from './components/pages/product.component';
import { ProductListingComponent } from './components/pages/product-listing.component';
import { NotFoundComponent } from './components/pages/not-found.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'listing/:codename',
        component: ProductListingComponent,
    },
    {
        path: 'product/:codename',
        component: ProductComponent,
    },
    {
        path: '**',
        component: NotFoundComponent,
    },
];
