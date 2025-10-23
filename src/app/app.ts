import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiHeaderComponent } from './components/ui/ui-header.component';
import { UiFooterComponent } from './components/ui/ui-footer.component';
import { AppFlexModule } from './components/ui/flex';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiHeaderComponent, UiFooterComponent, AppFlexModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Usana Demo');
}
