import { State, Keep, Start, IDevice } from './types';
import io from 'socket.io';
import fullName from 'fullname';
import { Observable, Subject } from 'rxjs';
import { MessageDoc } from '@/rxdb/message/model';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import http from 'http';

type MessageResp = {
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
  authorize: (args: IDevice) => Promise<boolean>,
  httpServer: http.Server
) {
  const ioServer = io.listen(httpServer, {
    serveClient: false,
    transports: ['websocket'],
  });
  const messageSubject = new Subject<MessageResp>();
  ioServer.sockets.on('connection', function(socket) {
    console.info(`Server connected with.. ${socket.handshake.address}🔥`);
    socket.on('authorize', async function(sender: IDevice, authorizeReq) {
      // For security reason check the identity is correct
      if (sender.ip !== socket.handshake.address) authorizeReq(false);
      console.info(`Asking for authorization... ${socket.handshake.address} 🗣`);
      authorizeReq(await authorize(sender));
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
export function listen(
  authorize_: (device: IDevice) => Promise<boolean>,
  port: number,
  ip: string
): Promise<[http.Server, Observable<MessageResp>]> {
  return new Promise<[http.Server, Observable<MessageResp>]>(
    (resolve_, reject_) => {
      const httpServer = http.createServer();
      httpServer.on('connection', (socket) => {
        console.info('http:connection');
        httpServer.once('close', (close: unknown) => {
          console.info('http:close', close);
          socket.destroy();
          httpServer.close();
        });
      });
      httpServer.on('error', (error) => {
        log.error(error);
        reject_(error);
      });
      // Init io.socket
      const messageStream = initSocket(authorize_, httpServer);
      // Listen to port
      httpServer.listen(port, ip || '0.0.0.0', () => {
        resolve_([httpServer, messageStream]);
        console.log(
          `Http server listening on http://${ip || '0.0.0.0'}:${port}🔥`
        );
      });
    }
  );
}
