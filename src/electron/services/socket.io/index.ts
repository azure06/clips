import { initServer } from './server';
import ioClient from 'socket.io-client';
import { findFirstAvailablePort, discoverDevices, ip } from './utils/network';

export { ip } from './utils/network';

export async function init() {
  if (ip.address) {
    await initServer(ip.address, await findFirstAvailablePort());
    // devices.forEach((device) => {
    //   initClient(
    //     device.ip,
    //     3000
    //   )('/Users/gabriele.sato/Codes/socket.io/cool.jpg');
    // });
  } else {
    console.error('Maybe offline...? 🦊');
  }
}
