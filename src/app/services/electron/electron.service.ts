import { Injectable } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';

// tslint:disable: max-classes-per-file
@Injectable()
export class ElectronService {
  // tslint:disable: no-use-before-declare
  private _mainWindow: MainWindow = new MainWindow();
  private _ipcRenderer: IpcRenderer = new IpcRenderer();

  public get isAvailable() {
    return !!((window as any).require && (window as any).require('electron'));
  }
  constructor() {
    if (this.isAvailable) {
      const { ipcRenderer, remote } = (window as any).require('electron');
      this._mainWindow.setRemote(remote);
      this._ipcRenderer.setIpcRenderer(ipcRenderer);
    }
  }

  get ipcRenderer() {
    return this._ipcRenderer;
  }

  get mainWindow() {
    return this._mainWindow;
  }
}

class IpcRenderer {
  private ipcRenderer: Electron.IpcRenderer;

  public setIpcRenderer(ipcRenderer: Electron.IpcRenderer) {
    this.ipcRenderer = ipcRenderer;
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
    return this.ipcRenderer
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
  public once(channel: string): Promise<{ event: Event; data: any }> {
    return new Promise((resolve, reject) => {
      this.ipcRenderer
        ? this.ipcRenderer.once(channel, (event, result) =>
            result && result.error
              ? reject({ event, error: result.error })
              : resolve({ event, data: result ? result.data : undefined })
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
    this.ipcRenderer
      ? this.ipcRenderer.send(channel, ...args)
      : console.warn('Electron in not available');
  }
}

class MainWindow {
  private remote?: Electron.Remote;
  private moveSubject: Subject<{
    preventDefault: () => void;
    sender: any;
  }> = new Subject();
  private resizeSubject: Subject<{
    preventDefault: () => void;
    sender: any;
  }> = new Subject();
  constructor() {}

  public setRemote(remote: Electron.Remote) {
    this.remote = remote;
  }

  public get mainWindow() {
    return this.remote ? this.remote.getCurrentWindow() : undefined;
  }

  public onMove() {
    if (!this.mainWindow) {
      return EMPTY;
    }
    this.mainWindow.on('move', ({ preventDefault, sender }) => {
      this.moveSubject.next({ preventDefault, sender });
    });
    return this.moveSubject.asObservable();
  }

  public onResize() {
    if (!this.mainWindow) {
      return EMPTY;
    }
    this.mainWindow.on('resize', ({ preventDefault, sender }) => {
      this.resizeSubject.next({ preventDefault, sender });
    });
    return this.resizeSubject.asObservable();
  }

  public setSize(width: number, height: number, animate?: boolean) {
    this.mainWindow
      ? this.mainWindow.setSize(width, height, animate)
      : console.warn('Electron is not available');
  }

  public setPosition(x: number, y: number, animate?: boolean) {
    this.mainWindow
      ? this.mainWindow.setPosition(x, y, animate)
      : console.warn('Electron is not available');
  }

  public center() {
    this.mainWindow
      ? this.mainWindow.center()
      : console.warn('Electron is not available');
  }
}
