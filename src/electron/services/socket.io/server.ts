import { Keep, Start, IDevice, MessageReq, isMessageText } from './types';
import io from 'socket.io';
import fullName from 'fullname';
import { Observable, Subject } from 'rxjs';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import http from 'http';
import {
  defaultContent,
  MessageDoc,
  stringifyContent,
} from '@/rxdb/message/model';

type MessageSub = {
  sender: IDevice;
  message: MessageDoc;
};

const DIR_DOWNLOAD = ((dir) => path.join(dir || '~', 'Downloads/'))(
  process.env.HOME || process.env.USERPROFILE
);

function onConnectionStart(data: Start) {
  // const dir = process.env.HOME || process.env.USERPROFILE;
  // prettier-ignore
  const target = path.join(DIR_DOWNLOAD, data.filename);
  fs.unlink(target, (err) => {
    if (err) console.log(err);
    else console.log('File deleted');
  });
}

function onConnectionKeep(data: Keep) {
  fs.appendFileSync(path.join(DIR_DOWNLOAD, data.filename), data.buffer);
}

function initSocket(
  authorize: (args: IDevice) => Promise<boolean>,
  httpServer: http.Server
) {
  const ioServer = io.listen(httpServer, {
    serveClient: false,
    transports: ['websocket'],
  });
  const messageSubject = new Subject<MessageSub>();
  ioServer.sockets.on('connection', function(socket) {
    console.info(`Server connected with.. ${socket.handshake.address}🔥`);
    socket.on('authorize', async function(sender: IDevice, authorizeReq) {
      // For security reason check the identity is correct
      if (sender.ip !== socket.handshake.address) authorizeReq(false);
      console.info(`Asking for authorization... ${socket.handshake.address} 🗣`);
      authorizeReq(await authorize(sender));
      socket.on('message', function(request: MessageReq, disconnectMe) {
        if (!isMessageText(request)) {
          switch (request.status) {
            case 'start':
              onConnectionStart(request);
              break;
            case 'keep':
              onConnectionKeep(request);
              break;
            case 'end':
              break;
            case 'error':
              // TODO Handle error
              break;
          }
        }
        const message = !isMessageText(request)
          ? ({
              id: path.join(DIR_DOWNLOAD, request.filename),
              type: 'file',
              ...(() => {
                switch (request.status) {
                  case 'error':
                    return {
                      status: 'rejected',
                      content: stringifyContent(defaultContent()),
                    };
                  default:
                    return {
                      status: request.status === 'end' ? 'sent' : 'pending',
                      content: stringifyContent({
                        path: path.join(DIR_DOWNLOAD, request.filename),
                        progress: request.progress,
                      }),
                    };
                }
              })(),
              senderId: sender.mac,
              ext: path.extname(request.filename),
            } as MessageDoc)
          : ({ ...request, type: 'text', status: 'sent' } as MessageDoc);
        messageSubject.next({ sender, message });
        disconnectMe();
      });
    });
    socket.on('recognize', async function(callback) {
      callback(await fullName());
    });
    socket.on('disconnect', function() {
      // TODO Watch 'messageSubject' and emit error when necessary
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
): Promise<[http.Server, Observable<MessageSub>]> {
  return new Promise<[http.Server, Observable<MessageSub>]>(
    (resolve_, reject_) => {
      const httpServer = http.createServer();
      httpServer.on('connection', (socket) => {
        console.info('Http Server connected with 💻', socket.remoteAddress);
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
