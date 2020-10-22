import { networkInterfaces } from 'os';
import getPort from 'get-port';

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
