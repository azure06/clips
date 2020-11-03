import fullName from 'fullname';
import getPort from 'get-port';
import internalIp from 'internal-ip';
import macaddress from 'macaddress';
import { IDevice } from '../types';

export const PortRange = {
  From: 56150,
  To: 56159,
};

/**
 * Find an available port in the following 56150 ~ 56159
 *
 */
function findPort(): Promise<number> {
  return getPort({ port: getPort.makeRange(PortRange.From, PortRange.To) });
}

export const iDevice = async (): Promise<IDevice | undefined> => {
  const ip = await internalIp.v4();
  return ip
    ? {
        name: '?',
        port: await findPort(),
        mac: await macaddress.one(),
        ip,
        username: (await fullName()) || '?',
      }
    : undefined;
};
