import { Component, HostBinding, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CoreComponent } from "../core/core.component";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'ui-checkbox',
    templateUrl: './ui-checkbox.component.html',
    styleUrl: './ui-checkbox.component.scss',
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class UiCheckboxComponent extends CoreComponent {
    public readonly label = input<string>();
    public readonly checked = input<boolean>(false);
    public readonly valueChange = output<boolean>();

    @HostBinding("style") style = "display: block";

    handleModelChange(value: boolean): void {
        this.valueChange.emit(value);
    }

    handleClick(event: Event): void {
        event.stopPropagation();
    }
}   