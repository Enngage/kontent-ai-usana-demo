export type ScreenResult = {
	readonly isMobileView: boolean;
	readonly isTabletView: boolean;
	readonly isDesktopView: boolean;
	readonly isDesktopExtraView: boolean;
	readonly screenSize: ScreenSize;
	readonly platform: ScreenPlatform;
};

export type ScreenPlatform = "mobile" | "tablet" | "desktop";
export type ScreenSize = "Mobile" | "Tablet" | "Desktop" | "DesktopExtra";
