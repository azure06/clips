import getPort from 'get-port';
import ip_ from 'ip';

export const PortRange = {
  From: 3000,
  To: 3010,
};

/**
 * Find an available port in the following 3000 ~ 3100
 */
export function findPort() {
  return getPort({ port: getPort.makeRange(PortRange.From, PortRange.To) });
}

export const ip = ip_;
