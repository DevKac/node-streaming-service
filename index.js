const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.get('/', (request, response) => {
  response.sendFile('views/index.html', { root : __dirname});
});

app.use('/static', express.static(path.join(__dirname, 'views/static')));

app.get('/videos', (request, response) => {
  const videoDirPath = 'assets/videos';
  fs.readdir(videoDirPath, (error, files) => {
      //handling error
      if (error) {
        return response.status(500).send('Unable to scan directory: ' + error);
      } 
      
      const availableVideos = [];
      files.forEach((file) => {
        const fileExt = path.parse(file).ext;
        if (fileExt !== '.mp4') {
          return;
        }

        const fileName = path.parse(file).name;
        const fileStats = fs.statSync(`${ videoDirPath }/${ file }`);
        const fileSize = fileStats.size;
        availableVideos.push({
          fileName,
          fileSize
          // czas trwania?
          // jakieś tagi?
          // może to powinno jednak iść z jakiegoś json'a? generowanie tego w ramach odpowiedzi API wydaje się mocno nieoptymalne. Assets/videos.json
        });
      });

      response.json(JSON.stringify(availableVideos));
  });
});

app.get('/video/:id', (request, response) => {
  const videoPath = `assets/videos/${request.params.id}.mp4`;
  const videoStat = fs.statSync(videoPath);
  const videoSize = videoStat.size;
  const videoRange = request.headers.range;
 
  if (videoRange) {
    // Parse Range
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(videoRange.replace(/\D/g, '')); // replace every (/g) occurrence of a non-digit (\D) character
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mkv',
    };

    // HTTP Status 206 for Partial Content
    response.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(response);
  } else {
    const headers = {
      'Content-Length': videoSize,
      'Content-Type': 'video/mp4',
    };
    response.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.get('/video/:id/thumbnail', (request, response) => {
  // todo: obsługa błędów jakby nie było?
  // generowanie thumbnaili?
  response.sendFile(`assets/thumbnails/${request.params.id}.jpg`, { root: __dirname });
});

app.get('/video/:id/caption', (request, response) => {
  // todo: obsługa błędów jakby nie było?
  // todo: co z językami?
  response.sendFile(`assets/captions/${request.params.id}.vtt`, { root: __dirname });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
