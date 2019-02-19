import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable()
export class ElectronService {
  public ipcRenderer?: IpcRenderer;

  constructor() {
    if ((window as any).require) {
      try {
        this.ipcRenderer = (window as any).require('electron').IpcRenderer;
      } catch (error) {
        throw error;
      }
    } else {
      console.warn('Could not load electron ipc');
    }
  }
}
