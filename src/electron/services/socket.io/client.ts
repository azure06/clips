import ioClient from 'socket.io-client';
import fs from 'fs';
import path from 'path';

export function initClient(ip: string, port: number) {
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
        console.warn('Something went wrong', err);
      });
    });
    socket.on('connect_error', function(err: any) {
      console.warn('Something went wrong', err);
    });
  };
}
