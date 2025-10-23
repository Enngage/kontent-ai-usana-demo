import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexFillLayoutComponent } from "./components/flex-fill-layout.component.js";
import {
	FlexColumnAlignDirective,
	FlexColumnDirective,
	FlexDirectionDirective,
	FlexFillDirective,
	FlexRowAlignDirective,
	FlexRowDirective,
	FlexRowGapDirective,
	FlexSizeDirective,
} from "./flex.directives.js";

@NgModule({
	imports: [CommonModule],
	declarations: [
		FlexRowDirective,
		FlexColumnDirective,
		FlexFillDirective,
		FlexSizeDirective,
		FlexRowAlignDirective,
		FlexRowGapDirective,
		FlexColumnAlignDirective,
		FlexDirectionDirective,
		FlexFillLayoutComponent,
	],
	exports: [
		FlexRowDirective,
		FlexColumnDirective,
		FlexFillDirective,
		FlexSizeDirective,
		FlexRowAlignDirective,
		FlexRowGapDirective,
		FlexColumnAlignDirective,
		FlexDirectionDirective,
		FlexFillLayoutComponent,
	],
})
export class AppFlexModule {}
