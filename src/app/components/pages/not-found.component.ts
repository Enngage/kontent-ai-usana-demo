import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonComponent } from '../ui/ui-button.component';

@Component({
    selector: 'not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    imports: [RouterLink, UiButtonComponent],
})
export class NotFoundComponent {
}

