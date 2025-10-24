import { Injectable, signal, WritableSignal } from "@angular/core";
import { PlatformService } from "../platform/platform.service.js";
import { debounceTime, fromEvent, Subject } from "rxjs";
import { match } from "ts-pattern";
import { ScreenPlatform, ScreenResult, ScreenSize } from "./screen.models.js";

@Injectable({
	providedIn: "root",
})
export class ScreenService {
	private readonly listenToScreenSizeChanges: boolean = true;

	private readonly mobileViewThreshold: number = 800;
	private readonly tabletViewThreshold: number = 1080;
	private readonly desktopViewThreshold: number = 1440;

	public readonly currentScreen: WritableSignal<ScreenResult>;

	public readonly screenChange = new Subject<ScreenResult>();
	public readonly screenChangeAll = new Subject<ScreenResult>();

	constructor(
		private readonly platformService: PlatformService,
	) {
		this.currentScreen = signal(this.getCurrentScreen());

		if (this.listenToScreenSizeChanges) {
			this.subscribeToScreenSizeChanges();
		}
	}

	private subscribeToScreenSizeChanges(): void {
		if (!this.platformService.isBrowser) {
			// read the screen size from the user agent
			return;
		}

		fromEvent(window, "resize")
			.pipe(debounceTime(100))
			.subscribe(() => {
				this.currentScreen.set(this.getCurrentScreen());
			});
	}



	private isDesktopView(): boolean {
		if (this.platformService.isServer) {
			return false;
		}

		// its running in browser
		return window.innerWidth >= this.tabletViewThreshold && window.innerWidth < this.desktopViewThreshold;
	}

	private isDesktopExtraView(): boolean {
		if (this.platformService.isServer) {
			return false;
		}

		// its running in browser
		return window.innerWidth >= this.desktopViewThreshold;
	}

	private isTabletView(): boolean {
		if (this.platformService.isServer) {
			return false;
		}

		// its running in browser
		return window.innerWidth > this.mobileViewThreshold && window.innerWidth < this.tabletViewThreshold;
	}

	private isMobileView(): boolean {
		if (this.platformService.isServer) {
			return false;
		}

		// its running in browser
		return window.innerWidth <= this.mobileViewThreshold;
	}

	private getCurrentScreen(): ScreenResult {
		const isMobileView = this.isMobileView();
		const isTabletView = this.isTabletView();
		const isDesktopView = this.isDesktopView();
		const isDesktopExtraView = this.isDesktopExtraView();

		const { screenSize, platform } = match({
			isMobileView,
			isTabletView,
			isDesktopView,
			isDesktopExtraView,
		})
			.returnType<{ readonly screenSize: ScreenSize; readonly platform: ScreenPlatform }>()
			.with({ isTabletView: true }, () => ({
				screenSize: "Tablet",
				platform: "tablet",
			}))
			.with({ isDesktopExtraView: true }, () => ({
				screenSize: "DesktopExtra",
				platform: "desktop",
			}))
			.with({ isDesktopView: true }, () => ({
				screenSize: "Desktop",
				platform: "desktop",
			}))
			.otherwise(() => {
				return {
					platform: "mobile",
					screenSize: "Mobile",
				};
			});

		return {
			screenSize: screenSize,
			platform: platform,
			isMobileView: isMobileView,
			isTabletView: isTabletView,
			isDesktopView: isDesktopView,
			isDesktopExtraView: isDesktopExtraView,
		};
	}


}
