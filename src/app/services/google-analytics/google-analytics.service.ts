import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

// d.ts file is broken
declare const ga: any;

@Injectable()
export class GoogleAnalyticsService {
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('Event', event.urlAfterRedirects);
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
  }

  public setUserId(userId: string) {
    setTimeout(() => {
      ga('set', 'userId', userId); // Set the user ID using signed-in user_id.
    });
  }

  public emitEvent(
    eventCategory: string,
    eventAction: string,
    eventLabel: string = null,
    eventValue: number = null
  ) {
    ga('send', 'event', { eventCategory, eventLabel, eventAction, eventValue });
  }
}
