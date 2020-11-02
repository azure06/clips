import { State, Keep, Start, IDevice } from './types';
import io from 'socket.io';
import fullName from 'fullname';
import { Subject } from 'rxjs';
import { MessageDoc } from '@/rxdb/message/model';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import http from 'http';

type MessageInfo = {
  sender: IDevice;
  message: MessageDoc;
};

const DIR_DOWNLOAD = ((dir) => path.join(dir || '~', 'Downloads/'))(
  process.env.HOME || process.env.USERPROFILE
);

function onConnectionStart(data: Start) {
  // const dir = process.env.HOME || process.env.USERPROFILE;
  // prettier-ignore
  const target = path.join(DIR_DOWNLOAD,data.fileName);
  fs.unlink(target, (err) => {
    if (err) console.log(err);
    else console.log('File deleted');
  });
}

function onConnectionKeep(data: Keep) {
  fs.appendFileSync(path.join(DIR_DOWNLOAD, data.fileName), data.buffer);
}

function initSocket(
  authorize_: (args: IDevice) => Promise<boolean>,
  httpServer: http.Server
) {
  const ioServer = io.listen(httpServer, { serveClient: false });
  const messageSubject = new Subject<MessageInfo>();
  ioServer.sockets.on('connection', function(socket) {
    console.info(`Server connected with.. ${socket.handshake.address}🔥`);
    socket.on('authorize', async function(sender: IDevice, authorizeReq) {
      // For security reason check the identity is correct
      if (sender.ip !== socket.handshake.address) authorizeReq(false);
      console.info(`Asking for authorization... ${socket.handshake.address} 🗣`);
      authorizeReq(await authorize_(sender));
      socket.on('message', function(state: State, resolve) {
        switch (state.status) {
          case 'start':
            onConnectionStart(state);
            break;
          case 'keep':
            onConnectionKeep(state);
            break;
          case 'end':
            socket.disconnect();
            break;
        }
        resolve();
      });
      socket.on('message-text', function(data, resolve) {
        messageSubject.next(data);
        resolve();
      });
    });
    socket.on('recognize', async function(callback) {
      callback(await fullName());
    });
    socket.on('disconnect', function() {
      console.log('Disconnected...🎬');
    });
  });
  return messageSubject.asObservable();
}

//  https://stackoverflow.com/questions/9018888/socket-io-connect-from-one-server-to-another
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function listen(port: number, ip: string) {
  return new Promise<[http.Server, typeof initSocket, Promise<boolean>]>(
    (resolve_, reject_) => {
      const httpServer = http.createServer();
      let close: () => void;
      httpServer.on('error', (error) => {
        reject_(error);
        log.error(error);
      });

      // Init Http server
      httpServer.listen(port, ip, () => {
        resolve_([
          httpServer,
          initSocket,
          new Promise((resolve) => (close = () => resolve(true))),
        ]);
        console.log(`Http server listening on http://${ip}:${port}🔥`);
      });

      httpServer.on('connection', (socket) => {
        httpServer.once('close', () => {
          socket.destroy();
          httpServer.close();
          close();
        });
      });
      // https://dev.to/gajus/how-to-terminate-a-http-server-in-node-js-ofk
    }
  );
}
