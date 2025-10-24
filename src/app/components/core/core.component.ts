import { Component, computed, inject } from "@angular/core";
import { ScreenService } from "../../services/screen/screen.service";
import { KontentAiService } from "../../services/kontent-ai.service";
import { ActivatedRoute } from "@angular/router";

export class CoreComponent {
    private readonly screenService = inject(ScreenService);

    protected readonly route = inject(ActivatedRoute);
    protected readonly kontentAiService = inject(KontentAiService);
    protected readonly currentScreen = computed(() => this.screenService.currentScreen());

}