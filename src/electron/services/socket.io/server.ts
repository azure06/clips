import http from 'http';
import io from 'socket.io';
import fs from 'fs';
import { ConnectionState, Keep, Start } from './types';
import path from 'path';
import fullName from 'fullname';

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
export async function initServer(ip: string, port: number) {
  const httpServer = http.createServer();
  const ioServer = io.listen(httpServer, { serveClient: false });
  ioServer.sockets.on('connection', function(socket) {
    console.log(`Server connected with.. ${socket.handshake.address}🔥`);
    socket.on('message', function(data: ConnectionState, resolve: () => any) {
      switch (data.status) {
        case 'start':
          onConnectionStart(data);
          break;
        case 'keep':
          onConnectionKeep(data);
          break;
        case 'end':
          socket.disconnect();
          break;
      }
      resolve();
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
}
