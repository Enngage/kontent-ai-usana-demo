import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { UiCheckboxComponent } from "./ui-checkbox.component";
import { CoreComponent } from "../core/core.component";
import { jsCookieHelper } from "../../utils/js-cookie-helper.class";

@Component({
    selector: 'ui-header',
    templateUrl: './ui-header.component.html',
    styleUrl: './ui-header.component.scss',
    imports: [RouterLink, UiCheckboxComponent],
})
export class UiHeaderComponent extends CoreComponent {
    onPreviewChange(enabled: boolean): void {
        this.kontentAiService.isPreview.set(enabled);
        jsCookieHelper.setCookie('is_preview', enabled ? 'true' : 'false', { expiresInDays: 30 });
    }
}   