import { ChangeDetectionStrategy, Component, input, TemplateRef } from "@angular/core";

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: "lib-flex-fill-layout",
	templateUrl: "flex-fill-layout.component.html",
	standalone: false,
})
export class FlexFillLayoutComponent {
	public readonly header = input<TemplateRef<undefined>>();
	public readonly content = input<TemplateRef<undefined>>();
	public readonly footer = input<TemplateRef<undefined>>();
}
