import { IDevice } from './types';
import ioClient from 'socket.io-client';
import findLocalDevices from 'local-devices';
import { Observable, ReplaySubject } from 'rxjs';
import { MessageDoc } from '@/rxdb/message/model';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import any from 'promise.any';
import pathNode from 'path';
import fs from 'fs';
import { ports } from './utils/network';
import progress, { Progress } from 'progress-stream';

any.shim();

const socketIoClientSettings = {
  reconnection: false,
  upgrade: false,
  transports: ['websocket'],
};

const style =
  'color: white; padding: 2px; border-radius: 5px; font-weight: 700';

function connect(ip: string, port: number): Promise<SocketIOClient.Socket> {
  return new Promise<SocketIOClient.Socket>((resolve, reject) => {
    const address = `ws://${ip}:${port}`;
    const socket = ioClient.connect(address, socketIoClientSettings);
    socket.on('connect', async () => {
      // prettier-ignore
      console.info(`%cConnected with ${address} 😈`,`background: rgb(0,140,180); ${style}`);
      resolve(socket);
    });
    socket.on('connect_error', function(error: unknown) {
      console.error('Something went wrong...', error);
      reject(error);
      socket.disconnect();
    });
  });
}

// prettier-ignore
function authorize(socket: SocketIOClient.Socket, sender: IDevice, receiver: IDevice): Promise<void> {
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
export async function sendMessage(sender: IDevice, receiver: IDevice, message: MessageDoc): Promise<MessageDoc> {
  const socket = await connect(receiver.ip, receiver.port);
  await authorize(socket, sender, receiver);
  // prettier-ignore
  console.info(`%cSending message to ${receiver.username} 🙈🙉🙊`,`background: rgb(235,0,135); ${style}`);
  return new Promise<MessageDoc>((resolve) => {
    socket.emit('message-text', { sender, message }, () => {
      console.info(`Disconnecting from ${receiver.username} 👀 🎬`);
      socket.disconnect();
      resolve(message);
    });
  });
}

export function sendFile(
  sender: IDevice,
  receiver: IDevice,
  message: MessageDoc
): Observable<Progress> {
  const replaySubject = new ReplaySubject<Progress>();
  (async () => {
    const socket = await connect(receiver.ip, receiver.port);
    await authorize(socket, sender, receiver);
    const filename = pathNode.basename(message.content);
    const stat = fs.statSync(message.content);
    const str = progress({
      length: stat.size,
      time: 100 /* ms */,
    });
    str.on('progress', function(progress) {
      console.info(progress);
      replaySubject.next(progress);
    });
    const readStream = fs.createReadStream(message.content).pipe(str);
    readStream.on('open', function() {
      socket.emit(
        'message',
        {
          fileName: filename,
          status: 'start',
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {}
      );
    });
    readStream.on('data', function(chunk) {
      socket.emit(
        'message',
        {
          fileName: filename,
          buffer: chunk as Buffer,
          status: 'keep',
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {}
      );
    });
    readStream.on('end', function() {
      socket.emit(
        'message',
        {
          fileName: filename,
          status: 'end',
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {
          socket.disconnect();
          replaySubject.complete();
        }
      );
    });
    readStream.on('error', function(err) {
      console.info('Something went wrong', err);
      replaySubject.error(err);
    });
  })();
  return replaySubject.asObservable();
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
              const socket = ioClient.connect(
                `ws://${device.ip}:${device.port}`,
                {
                  ...socketIoClientSettings,
                  timeout: 5000,
                }
              );
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
