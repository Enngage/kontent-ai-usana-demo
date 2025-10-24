import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'ui-header',
    templateUrl: './ui-header.component.html',
    styleUrl: './ui-header.component.scss',
    imports: [RouterLink],
})
export class UiHeaderComponent { }   