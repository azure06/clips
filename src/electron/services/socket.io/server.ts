import http from 'http';
import io from 'socket.io';
import fs from 'fs';
import { State, Keep, Start, IDevice } from './types';
import path from 'path';
import fullName from 'fullname';
import { Subject } from 'rxjs';
import { MessageDoc } from '@/rxdb/message/model';

const DIR_DOWNLOAD = ((dir) => path.join(dir || '~', 'Downloads/'))(
  process.env.HOME || process.env.USERPROFILE
);

function onConnectionStart(data: Start) {
  const dir = process.env.HOME || process.env.USERPROFILE;
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

//  https://stackoverflow.com/questions/9018888/socket-io-connect-from-one-server-to-another
export function observe(
  getAuthorization: (device: IDevice) => Promise<Boolean>,
  ip: string,
  port: number
) {
  const httpServer = http.createServer();
  const ioServer = io.listen(httpServer, { serveClient: false });
  const messageSubject = new Subject<MessageDoc>();
  ioServer.sockets.on('connection', function(socket) {
    console.info(`Server connected with.. ${socket.handshake.address}🔥`);
    socket.on('authorize', async function(sender: IDevice, authorize) {
      // For security reason check the identity is correct
      if (sender.ip !== socket.handshake.address) authorize(false);
      console.info(
        `Asking for authorization... ${socket.handshake.address} 👾`
      );
      authorize(await getAuthorization(sender));
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
  // Init Http server
  httpServer.listen(port, ip, () =>
    console.log(`Http server listening on http://${ip}:3000`)
  );
  return messageSubject.asObservable();
}
