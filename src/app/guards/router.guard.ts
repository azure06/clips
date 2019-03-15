import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Injectable()
export class RouterGuard implements CanActivate {
  constructor(private navCtrl: NavController) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!((window as any).require && (window as any).require('electron'))) {
      this.navCtrl.navigateRoot('');
      return false;
    }
    return true;
  }
}
