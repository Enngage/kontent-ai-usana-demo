import { rmSync } from "node:fs";
import {
	generateDeliveryModelsAsync,
	generateEnvironmentModelsAsync,
	generateItemsAsync,
	generateMigrationModelsAsync,
	generateSyncModelsAsync,
	resolveCase,
} from "@kontent-ai/model-generator";
import { runScript } from "./script.helper";
import { getEnvironmentRequiredValue } from "../environmentHelper";

const modelsToGenerate: readonly {
	readonly folder: string;
	readonly func: (envId: string, mapiKey: string, deliveryKey: string, folder: string) => Promise<void>;
}[] = [
		{
			folder: "./src/_generated/delivery",
			func: async (envId, mapiKey, _deliveryKey, folder) => {
				await generateDeliveryModelsAsync({
					addTimestamp: false,
					environmentId: envId,
					managementApiKey: mapiKey,
					outputDir: folder,
					moduleFileExtension: "none",
					createFiles: true,
					nameResolvers: {
						contentType: (type) => {
							return resolveCase(type.name, "pascalCase");
						},
					},
				});
			},
		},
		{
			folder: "./src/_generated/environment",
			func: async (envId, mapiKey, _deliveryKey, folder) => {
				await generateEnvironmentModelsAsync({
					addTimestamp: false,
					environmentId: envId,
					managementApiKey: mapiKey,
					outputDir: folder,
					moduleFileExtension: "none",
					createFiles: true,
				});
			},
		},
		{
			folder: "./src/_generated/sync",
			func: async (envId, mapiKey, _deliveryKey, folder) => {
				await generateSyncModelsAsync({
					addTimestamp: false,
					environmentId: envId,
					managementApiKey: mapiKey,
					outputDir: folder,
					moduleFileExtension: "none",
					createFiles: true,
				});
			},
		},
		{
			folder: "./src/_generated/migration",
			func: async (envId, mapiKey, _deliveryKey, folder) => {
				await generateMigrationModelsAsync({
					addTimestamp: false,
					environmentId: envId,
					managementApiKey: mapiKey,
					outputDir: folder,
					moduleFileExtension: "none",
					createFiles: true,
				});
			},
		},
	];

runScript({
	enabled: true,
	run: async () => {
		for (const model of modelsToGenerate) {
			await generateModelsAsync(model);
		}
	},
});

async function generateModelsAsync(data: {
	readonly folder: string;
	readonly func: (envId: string, apiKey: string, deliveryKey: string, folder: string) => Promise<void>;
}): Promise<void> {
	const envId = getEnvironmentRequiredValue("KONTENT_ENVIRONMENT_ID");
	const mapiKey = getEnvironmentRequiredValue("KONTENT_MANAGEMENT_API_KEY");
	const deliveryKey = getEnvironmentRequiredValue("KONTENT_SECURE_API_KEY");

	console.log("Deleting existing folder", data.folder);

	rmSync(data.folder, {
		recursive: true,
		force: true,
	});

	try {
		await data.func(envId, mapiKey, deliveryKey, data.folder);
	} catch (err) {
		console.error(err);
		throw err;
	}
}
