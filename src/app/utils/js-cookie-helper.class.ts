import Cookies from "js-cookie";

export class JsCookieHelper {
	setCookie(
		name: string,
		value: string,
		options?: {
			readonly expiresInDays?: number;
		},
	): void {
		Cookies.set(name, value, {
			expires: options?.expiresInDays,
		});
	}

	deleteCookie(name: string): void {
		Cookies.remove(name);
	}

	getCookie(name: string): string | undefined {
		return Cookies.get(name);
	}
}

export const jsCookieHelper = new JsCookieHelper();
