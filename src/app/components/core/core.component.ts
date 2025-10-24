import { computed, inject } from "@angular/core";
import { ScreenService } from "../../services/screen/screen.service";
import { KontentAiService } from "../../services/kontent-ai.service";
import { ActivatedRoute } from "@angular/router";
import { CommerceToolsService } from "../../services/commerce-tools.service";
import { ScrollPositionService } from "../../services/scroll-position.service";

export class CoreComponent {
    private readonly screenService = inject(ScreenService);
    private readonly scrollPositionService = inject(ScrollPositionService);
    protected readonly isPreview = computed(() => this.kontentAiService.isPreview());
    protected readonly commerceToolsService = inject(CommerceToolsService);
    protected readonly route = inject(ActivatedRoute);
    protected readonly kontentAiService = inject(KontentAiService);
    protected readonly currentScreen = computed(() => this.screenService.currentScreen());

    protected withPreservedScrollPosition<T>(callback: () => Promise<T>): Promise<T> {
        const key = this.route.snapshot.url.join('/')+ new Date().getTime();
        this.scrollPositionService.saveScrollPosition(key);
       
        return callback().then(result => {
            setTimeout(() => {
                this.scrollPositionService.restoreScrollPosition(key)
            }, 50);
            return result;
        });
    }
}