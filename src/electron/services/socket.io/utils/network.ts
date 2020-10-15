import { networkInterfaces } from 'os';
import getPort from 'get-port';
import findLocalDevices from 'local-devices';
import ioClient from 'socket.io-client';
import { Subject } from 'rxjs';

export const PortRange = {
  From: 3000,
  To: 3010,
};

/**
 * Find an available port in the following 3000 ~ 3100
 */
export function findFirstAvailablePort() {
  return getPort({ port: getPort.makeRange(PortRange.From, PortRange.To) });
}

export const ip = {
  get networkInfo() {
    return Object.entries(networkInterfaces()).reduce(
      (
        acc: { [key: string]: typeof netInfo; en0: typeof netInfo },
        [name, netInfo]
      ) =>
        !!netInfo
          ? {
              ...acc,
              [name]: netInfo.filter(
                (value) => value.family === 'IPv4' && !value.internal
              ),
            }
          : acc,
      {} as any
    );
  },
  /**
   * Get local IP address
   * https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
   * Consider https://github.com/indutny/node-ip/blob/master/lib/ip.js
   */
  get address() {
    const interfaces = this.networkInfo;
    return interfaces.en0 ? interfaces.en0[0].address : undefined;
  },
};

/**
 * Discover the available devices over the network
 * TODO: This implementation works only if subnetmask is 255.255.255.1
 *
 * Ex. From 192.168.11.1 ~ 192.168.11.254
 */
type IDevice = findLocalDevices.IDevice & { username: string };
export function discoverDevices(ip: string) {
  const iDeviceSubject = new Subject<IDevice>();
  const [network1, network2, subnet] = ip.split('.').map((value) => +value);
  const ports = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Find available devices
  findLocalDevices(
    `${network1}.${network2}.${subnet}.1-${network1}.${network2}.${subnet}.254`
  )
    .then((devices) =>
      ports.flatMap((port) =>
        devices.map((device) =>
          new Promise((resolve, reject) => {
            const socket = ioClient.connect(`http://${device.ip}:300${port}`, {
              reconnection: false,
            });
            socket.on('connect_error', reject);
            socket.on('connect', () => {
              socket.emit('recognize', (username: string) => {
                iDeviceSubject.next({ ...device, username });
                resolve();
                socket.disconnect();
              });
            });
          }).catch((error) => console.info('connect_error', error))
        )
      )
    )
    .then((devices) => Promise.all(devices))
    .finally(() => iDeviceSubject.complete());
  return iDeviceSubject.asObservable();
}
