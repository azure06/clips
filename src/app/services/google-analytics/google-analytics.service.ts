import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ElectronService } from '../electron/electron.service';

// d.ts file is broken
declare const ga: any;

@Injectable()
export class GoogleAnalyticsService {
  constructor(private router: Router, private es: ElectronService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('Event', event.urlAfterRedirects);
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }

  public trackEvent(
    eventCategory: string,
    eventAction: string,
    eventLabel: string = null,
    eventValue: number = null
  ) {
    !this.es.isAvailable
      ? ga('send', 'event', {
          eventCategory,
          eventLabel,
          eventAction,
          eventValue
        })
      : this.es.eventTracker.trackEvent(
          eventCategory,
          eventLabel,
          eventAction,
          eventValue
        );
  }
}
