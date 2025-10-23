import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class PlatformService {
	public readonly isBrowser: boolean;
	public readonly isServer: boolean;

	constructor(
		@Inject(PLATFORM_ID)
		public platformId: object,
	) {
		this.isBrowser = isPlatformBrowser(platformId);
		this.isServer = !this.isBrowser;
	}
}
