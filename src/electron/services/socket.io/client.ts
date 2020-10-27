import ioClient from 'socket.io-client';
import fs from 'fs';
import path from 'path';
import findLocalDevices from 'local-devices';
import { Subject } from 'rxjs';
import { MessageDoc } from '@/rxdb/message/model';
import { IDevice } from './types';

export function sendMessage(
  sender: IDevice,
  receiver: IDevice,
  message: MessageDoc
): Promise<MessageDoc> {
  return new Promise<MessageDoc>((resolve, reject) => {
    const target = `http://${receiver.ip}:${receiver.port}`;
    const socket = ioClient.connect(target, {
      reconnection: false,
    });
    socket.on('connect', () => {
      console.info(`Get authorization from  ${target}`);
      socket.emit('authorize', sender, (result: boolean) => {
        console.info(
          result
            ? `Yeeeeeehaw!!! 🦊  Got authorization~!`
            : 'Authorization rejected 😿'
        );
        if (!result) {
          socket.disconnect();
          reject(new Error(`${receiver.username} rejected your request 🥶`));
        }
        console.info(`Sending message to ${target} 🙈🙉🙊`);
        // Send deviceInfo and message
        socket.emit('message-text', { sender, message }, () => {
          socket.disconnect();
          console.info(`Disconnected from ${target} 👀 🎬`);
          resolve(message);
        });
      });
    });
    socket.on('connect_error', function(err: any) {
      console.error('Something went wrong', err);
      socket.disconnect();
      reject(err);
    });
  });
}

export function sendData(ip: string, port: number) {
  return (targetPath: string) => {
    console.log('Target', `http://${ip}:${port}`, targetPath);
    const socket = ioClient.connect(`http://${ip}:${port}`);
    socket.on('connect', () => {
      console.log(`Client connected with.. http://${ip}:${port}🔥`);
      const fileName = path.basename(targetPath);
      var readStream = fs.createReadStream(targetPath);
      readStream.on('open', function() {
        socket.emit(
          'message',
          {
            fileName,
            status: 'start',
          },
          () => {}
        );
      });
      readStream.on('data', function(chunk) {
        socket.emit(
          'message',
          {
            fileName,
            buffer: chunk as Buffer,
            status: 'keep',
          },
          () => {}
        );
      });
      readStream.on('end', function() {
        socket.emit(
          'message',
          {
            fileName,
            status: 'end',
          },
          () => {}
        );
      });
      readStream.on('error', function(err) {
        console.info('Something went wrong', err);
      });
    });
    socket.on('connect_error', function(err: any) {
      console.info('Something went wrong', err);
    });
  };
}

/**
 * Discover the available devices over the network
 * TODO: This implementation works only if subnetmask is 255.255.255.1
 *
 * Ex. From 192.168.11.1 ~ 192.168.11.254
 */
export function discoverDevices(ip: string) {
  const iDeviceSubject = new Subject<IDevice>();
  const [network1, network2, subnet] = ip.split('.').map((value) => +value);
  const ports = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Find available devices
  findLocalDevices(
    `${network1}.${network2}.${subnet}.1-${network1}.${network2}.${subnet}.254`
  )
    .then((devices) =>
      ports.flatMap((num) =>
        devices.map((device) =>
          new Promise((resolve, reject) => {
            const port = +`300${num}`;
            const socket = ioClient.connect(`http://${device.ip}:${port}`, {
              reconnection: false,
            });
            socket.on('connect_error', reject);
            socket.on('connect', () => {
              socket.emit('recognize', (username: string) => {
                iDeviceSubject.next({ ...device, username, port });
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
