import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiHeaderComponent } from './components/ui/ui-header.component';
import { UiFooterComponent } from './components/ui/ui-footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiHeaderComponent, UiFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Usana Demo');
}
