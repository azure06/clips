import fs from 'fs';
import pathNode from 'path';

import findLocalDevices from 'local-devices';
import { Observable, ReplaySubject } from 'rxjs';
import { concatMap, scan, tap } from 'rxjs/operators';
import ioClient, { Socket } from 'socket.io-client';

import { Message } from '@/rxdb-v2/src/types';

import { parseMessageContent } from '@/rxdb-v2/src/utils';
import { IDevice, StateOmitP as PartialState, Progress, State } from './types';
import { ports } from './utils/network';

const socketIoClientSettings = {
  reconnection: false,
  upgrade: false,
  transports: ['websocket'],
};

const style =
  'color: white; padding: 2px; border-radius: 5px; font-weight: 700';

function connect(ip: string, port: number): Promise<Socket> {
  return new Promise<Socket>((resolve, reject) => {
    const address = `ws://${ip}:${port}`;
    const socket = ioClient(address, socketIoClientSettings);
    socket.on('connect', async () => {
      // prettier-ignore
      console.info(`%cConnected with ${address} 😈`,`background: rgb(0,140,180); ${style}`);
      resolve(socket);
    });
    socket.on('connect_error', function (error: unknown) {
      console.error('Something went wrong...', error);
      reject(error);
      socket.disconnect();
    });
  });
}

// prettier-ignore
function authorize(socket: Socket, sender: IDevice, receiver: IDevice): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    socket.emit('authorize', sender, (result: boolean) => {
      console.info(`Asking authorization from ${receiver.username} 💻`);
      return !result
        ? (() => {
            const message = `%c${receiver.username} rejected your request ⚠️`;
            console.info(message, `background: rgb(255,0,60); ${style}`);
            reject(new Error(message));
            socket.disconnect();
          })()
        : (() => {
            // prettier-ignore
            console.info(`%cYeeeeeehaw!!! 🌈🦊 Authorized~!`,`background: rgb(0,110,230); ${style}`);
            resolve();
          })();
    });
  });
}

// prettier-ignore
export async function sendMessage(sender: IDevice, receiver: IDevice, message: Message): Promise<Message> {
  const socket = await connect(receiver.ip, receiver.port);
  await authorize(socket, sender, receiver);
  // prettier-ignore
  console.info(`%cSending message to ${receiver.username} 🙈🙉🙊`,`background: rgb(235,0,135); ${style}`);
  return new Promise<Message>((resolve) => {
    socket.emit('message', message, () => {
      console.info(`Disconnecting from ${receiver.username} 👀 🎬`);
      socket.disconnect();
      resolve(message);
    });
  });
}

export function sendFile(
  sender: IDevice,
  receiver: IDevice,
  message: Message
): Observable<Progress> {
  const progressReplay = new ReplaySubject<Progress>(1);
  const emitReplay = new ReplaySubject<PartialState>();
  const completeAll = () => {
    progressReplay.complete();
    emitReplay.complete();
  };
  if (fs.lstatSync(parseMessageContent(message.content).path).isDirectory()) {
    completeAll();
  } else {
    (async () => {
      const socket = await connect(receiver.ip, receiver.port);
      return authorize(socket, sender, receiver)
        .then(() => {
          const { path } = parseMessageContent(message.content);
          const filename = pathNode.basename(path);
          const stat = fs.statSync(path);
          const readStream = fs.createReadStream(path);
          emitReplay
            .pipe(
              scan<PartialState, [number, State]>(
                ([start, acc], value) => {
                  const [transferred, speed] =
                    'buffer' in value && 'progress' in acc
                      ? [
                          value.buffer.byteLength + acc.progress.transferred,
                          (value.buffer.byteLength / (Date.now() - start)) *
                            1000, // Byte/sec
                        ]
                      : [];
                  return 'progress' in acc
                    ? [
                        start,
                        {
                          ...acc,
                          ...value,
                          progress: {
                            ...acc.progress,
                            percentage: transferred
                              ? (transferred / acc.progress.length) * 100
                              : acc.progress.percentage,
                            transferred:
                              transferred || acc.progress.transferred,
                            remaining: transferred
                              ? acc.progress.length - transferred
                              : acc.progress.transferred,
                            eta: 0,
                            runtime: Date.now() - start,
                            speed: speed || acc.progress.speed,
                          },
                        },
                      ]
                    : [start, { ...acc, value }];
                },
                [
                  Date.now(),
                  {
                    progress: {
                      length: stat.size,
                      remaining: stat.size,
                      transferred: 0,
                      percentage: 0,
                      eta: 0,
                      runtime: 0,
                      speed: 0,
                    },
                  } as State,
                ]
              ),
              concatMap(
                ([, state]) =>
                  new Promise<State>((next) =>
                    socket.emit('message', state, () => next(state))
                  )
              ),
              tap((state) => {
                if ('progress' in state) progressReplay.next(state.progress);
                if (state.status === 'end' || state.status === 'error')
                  completeAll();
              })
            )
            .subscribe();
          readStream.on('open', function () {
            emitReplay.next({
              filename,
              status: 'start',
            });
          });
          readStream.on('data', function (chunk) {
            emitReplay.next({
              filename,
              buffer: chunk as Buffer,
              status: 'keep',
            });
          });
          readStream.on('end', function () {
            emitReplay.next({
              filename,
              status: 'end',
            });
          });
          readStream.on('error', function (error) {
            emitReplay.next({
              filename,
              status: 'error',
            });
            console.info('Something went wrong', error);
          });
        })
        .catch((error) => {
          console.info('Authorization refused...', error);
          completeAll();
          socket.disconnect();
        });
    })();
  }
  return progressReplay.asObservable();
}

/**
 * Discover the available devices over the network
 * TODO: This implementation works only if subnetmask is 255.255.255.1
 *
 * Ex. From 192.168.11.1 ~ 192.168.11.254
 */
export function discoverDevices(ip: string): Observable<IDevice> {
  const iDeviceReplay = new ReplaySubject<IDevice>();
  const [network1, network2, subnet] = ip.split('.').map((value) => +value);
  // Find available devices
  findLocalDevices(
    `${network1}.${network2}.${subnet}.1-${network1}.${network2}.${subnet}.254`
  )
    .then((devices) =>
      devices
        .flatMap((device) =>
          ports.map((port) => ({
            ...device,
            port,
          }))
        )
        .map(
          (device) =>
            new Promise<void>((resolve) => {
              const socket = ioClient(`ws://${device.ip}:${device.port}`, {
                ...socketIoClientSettings,
                timeout: 5000,
              });
              socket.on('connect_error', (error: unknown) => {
                console.info('connect_error', error);
                resolve();
              });
              socket.on('connect', () => {
                socket.emit('recognize', (username: string) => {
                  iDeviceReplay.next({ ...device, username });
                  socket.disconnect();
                  resolve();
                });
              });
            })
        )
    )
    .then((devices) => Promise.all(devices))
    .finally(() => iDeviceReplay.complete());

  return iDeviceReplay.asObservable();
}
