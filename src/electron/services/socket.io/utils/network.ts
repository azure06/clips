import fullName from 'fullname';
import getPort from 'get-port';
import internalIp from 'internal-ip';
import macaddress from 'macaddress';
import { IDevice } from '../types';

export const PortRange = {
  From: 3000,
  To: 3009,
};

function fromTo(from: number, to: number, acc: number[]): number[] {
  return from <= to ? fromTo(from + 1, to, [...acc, from]) : acc;
}

export const ports = fromTo(PortRange.From, PortRange.To, []);

/**
 * Find an available port in the following 3000 ~ 3009
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
