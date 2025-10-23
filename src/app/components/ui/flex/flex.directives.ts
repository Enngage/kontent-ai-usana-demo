import { computed, Directive, ElementRef, effect, input, Renderer2, Signal } from "@angular/core";
import { FlexColumnAlign, FlexDirection, FlexRowAlign, FlexRowGap, FlexSize } from "./flex.models.js";
import { PlatformService } from "../../../services/platform/platform.service.js";

/**
 * Adding classes on SSR might result in duplicate classes when hydrated on client.
 * We need to remove classes added by server
 */
function addOrRemovesClass(
	_platformService: PlatformService,
	renderer2: Renderer2,
	element: Element,
	className: string,
	prefixOfClassNameToRemove: string,
	enabled = true,
): void {
	if (element) {
		const classes: string[] = element.className
			?.trim()
			.split(" ")
			.map((m) => m?.trim());

		for (const existingClass of classes) {
			if (existingClass.toLowerCase().startsWith(prefixOfClassNameToRemove.toLowerCase())) {
				renderer2.removeClass(element, existingClass);
			}
		}

		if (enabled) {
			renderer2.addClass(element, className);
		}
	}
}

function _removeClass(_platformService: PlatformService, renderer2: Renderer2, element: Element, className: string): void {
	if (element) {
		renderer2.removeClass(element, className);
	}
}

@Directive({
	selector: "[libFlexRow]",
	standalone: false,
})
export class FlexRowDirective {
	public readonly enabled: Signal<boolean> = computed(() => {
		return this.libFlexRow() === true;
	});

	public readonly libFlexRow = input<boolean | "">();

	constructor(
		private readonly platformService: PlatformService,
		private readonly renderer2: Renderer2,
		private readonly hostElement: ElementRef,
	) {
		// always add flex row class
		this.renderer2.addClass(hostElement.nativeElement, "ui-flex-row");

		effect(() => {
			const enabled = this.enabled();
			addOrRemovesClass(
				this.platformService,
				this.renderer2,
				this.hostElement.nativeElement,
				"ui-flex-wrap",
				"ui-flex-wrap",
				enabled,
			);
		});
	}
}

@Directive({
	selector: "[libFlexColumn]",
	standalone: false,
})
export class FlexColumnDirective {
	constructor(
		readonly renderer2: Renderer2,
		readonly hostElement: ElementRef,
	) {
		this.renderer2.addClass(hostElement.nativeElement, "ui-flex-column");
	}
}

@Directive({
	selector: "[libFlexFill]",
	standalone: false,
})
export class FlexFillDirective {
	constructor(
		private hostElement: ElementRef,
		private renderer2: Renderer2,
		private platformService: PlatformService,
	) {
		addOrRemovesClass(this.platformService, this.renderer2, this.hostElement.nativeElement, "ui-flex-size-fill", "ui-flex-size-fill");
	}
}

@Directive({
	selector: "[libFlexSize]",
	standalone: false,
})
export class FlexSizeDirective {
	public readonly libFlexSize = input<FlexSize>();

	constructor(
		private readonly hostElement: ElementRef,
		private readonly renderer2: Renderer2,
		private readonly platformService: PlatformService,
	) {
		effect(() => {
			addOrRemovesClass(
				this.platformService,
				this.renderer2,
				this.hostElement.nativeElement,
				`ui-flex-size-${this.libFlexSize()}`,
				"ui-flex-size",
			);
		});
	}
}

@Directive({
	selector: "[libFlexRowAlign]",
	standalone: false,
})
export class FlexRowAlignDirective {
	public readonly libFlexRowAlign = input<FlexRowAlign>();

	constructor(
		private readonly platformService: PlatformService,
		private readonly renderer2: Renderer2,
		private readonly hostElement: ElementRef,
	) {
		effect(() => {
			addOrRemovesClass(
				this.platformService,
				this.renderer2,
				this.hostElement.nativeElement,
				`ui-flex-row-align-${this.libFlexRowAlign()}`,
				"ui-flex-row-align",
				true,
			);
		});
	}
}

@Directive({
	selector: "[libFlexColumnAlign]",
	standalone: false,
})
export class FlexColumnAlignDirective {
	public readonly libFlexColumnAlign = input<FlexColumnAlign>();

	constructor(
		private readonly platformService: PlatformService,
		private readonly renderer2: Renderer2,
		private readonly hostElement: ElementRef,
	) {
		effect(() => {
			addOrRemovesClass(
				this.platformService,
				this.renderer2,
				this.hostElement.nativeElement,
				`ui-flex-align-${this.libFlexColumnAlign()}`,
				"ui-flex-align",
				true,
			);
		});
	}
}

@Directive({
	selector: "[libFlexRowGap]",
	standalone: false,
})
export class FlexRowGapDirective {
	public readonly libFlexRowGap = input<FlexRowGap>();

	constructor(
		private readonly platformService: PlatformService,
		private readonly renderer2: Renderer2,
		private readonly hostElement: ElementRef,
	) {
		effect(() => {
			addOrRemovesClass(
				this.platformService,
				this.renderer2,
				this.hostElement.nativeElement,
				`ui-flex-row-gap-${this.libFlexRowGap()}`,
				"ui-flex-row-gap",
				true,
			);
		});
	}
}

@Directive({
	selector: "[libFlexDirection]",
	standalone: false,
})
export class FlexDirectionDirective {
	public readonly libFlexDirection = input<FlexDirection>();

	constructor(
		private readonly platformService: PlatformService,
		private readonly renderer2: Renderer2,
		private readonly hostElement: ElementRef,
	) {
		effect(() => {
			addOrRemovesClass(
				this.platformService,
				this.renderer2,
				this.hostElement.nativeElement,
				`ui-flex-row-direction-${this.libFlexDirection()}`,
				"ui-flex-row-direction",
				true,
			);
		});
	}
}
