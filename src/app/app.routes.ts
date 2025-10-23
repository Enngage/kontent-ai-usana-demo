import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home.component';
import { ArticleComponent } from './components/pages/article.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'article',
        component: ArticleComponent,
    },
];
