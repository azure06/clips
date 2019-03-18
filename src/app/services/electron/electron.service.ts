import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ElectronService {
  private get available() {
    return !!((window as any).require && (window as any).require('electron'));
  }

  private get ipcRenderer(): typeof Electron.ipcRenderer {
    if (!this.available) {
      return null;
    }
    const { ipcRenderer } = (window as any).require('electron');
    return ipcRenderer;
  }

  /**
   * Listens to channel, when a new message arrives listener would be called with
   * listener(event, args...).
   */
  public on(
    channel: string,
    listener: (event: any, data: any) => any
  ): {
    removeListener?: () => void;
  } {
    return this.available
      ? (() => {
          this.ipcRenderer.on(channel, listener);
          return {
            removeListener: () => {
              this.ipcRenderer.removeListener(channel, listener);
            }
          };
        })()
      : {};
  }

  /**
   * Adds a one time listener function for the event. This listener is invoked only
   * the next time a message is sent to channel, after which it is removed.
   */
  public once(channel: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.available
        ? this.ipcRenderer.once(channel, (event, data) =>
            resolve({ event, data })
          )
        : reject('Electron is not available');
    });
  }
  /**
   * Send a message to the main process asynchronously via channel, you can also send
   * arbitrary arguments. Arguments will be serialized in JSON internally and hence
   * no functions or prototype chain will be included. The main process handles it by
   * listening for channel with ipcMain module.
   */
  public send(channel: string, ...args: any[]) {
    this.ipcRenderer.send(channel, args);
  }
}
