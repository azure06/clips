import { clipboard } from 'electron';

export default class ClipboardService {
  constructor() {
    const a = clipboard.readText();
    console.log(a);
  }
}
