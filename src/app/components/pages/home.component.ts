import { Component } from "@angular/core";
import { KontentAiService } from "../../services/kontent-ai.service";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
})
export class HomeComponent {
    constructor(private kontentAiService: KontentAiService) { }
}