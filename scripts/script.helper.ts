import dotenv from "dotenv";

export function runScript(data: { readonly run: () => Promise<void>; readonly enabled: boolean }): void {
	checkScriptEnabled(data.enabled);
	loadEnvConfig();

	data.run()
		.then()
		.catch((error) => {
			// to avoid unhandled exception caused by rejecting promise use manual logging
			console.error(error);
		});
}

function loadEnvConfig(): void {
	dotenv.config({
		path: "./.env.local",
	});
}

function checkScriptEnabled(enabled: boolean): void {
	if (!enabled) {
		throw Error("Script is disabled");
	}
}
