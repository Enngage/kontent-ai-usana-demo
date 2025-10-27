import { Component, inject, signal } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { UiHeaderComponent } from './components/ui/ui-header.component';
import { UiFooterComponent } from './components/ui/ui-footer.component';
import { AppFlexModule } from './components/ui/flex';
import { CoreComponent } from './components/core/core.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiHeaderComponent, UiFooterComponent, AppFlexModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App extends CoreComponent {
  protected readonly title = signal('Usana Demo');
  protected readonly router = inject(Router);

  constructor() {
    super();

    this.subscribeToRouteNavigationEnd();
  }

  private subscribeToRouteNavigationEnd(): void {
    super.subscribeToObservable(
      this.router.events.pipe(
        map((data) => {
          if (data instanceof NavigationStart) {
            this.scrollPositionService.scrollToTop();
          }
        }),
      ),
    );
  }
}
