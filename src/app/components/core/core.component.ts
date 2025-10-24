import { computed, inject, signal } from "@angular/core";
import { ScreenService } from "../../services/screen/screen.service";
import { KontentAiService } from "../../services/kontent-ai.service";
import { ActivatedRoute } from "@angular/router";
import { CommerceToolsService } from "../../services/commerce-tools.service";
import { jsCookieHelper } from "../../utils/js-cookie-helper.class";

export class CoreComponent {
    private readonly screenService = inject(ScreenService);
    protected readonly isPreview = computed(() => this.kontentAiService.isPreview());
    protected readonly commerceToolsService = inject(CommerceToolsService);
    protected readonly route = inject(ActivatedRoute);
    protected readonly kontentAiService = inject(KontentAiService);
    protected readonly currentScreen = computed(() => this.screenService.currentScreen());

}