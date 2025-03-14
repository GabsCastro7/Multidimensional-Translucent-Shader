import express from 'express';
import ytdl from 'ytdl-core';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/youtube-audio', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send('Missing YouTube ID');
    }

    const info = await ytdl.getInfo(id);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    if (!audioFormat) {
      return res.status(404).send('No suitable audio format found');
    }

    res.setHeader('Content-Type', audioFormat.mimeType);
    ytdl(id, { format: audioFormat })
      .on('error', (err) => {
        console.error('Error streaming audio:', err);
        res.status(500).send('Error streaming audio');
      })
      .pipe(res);
  } catch (error) {
    console.error('Error fetching YouTube audio:', error);
    res.status(500).send('Error fetching YouTube audio');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
