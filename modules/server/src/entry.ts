import express from 'express';
import fetch from 'node-fetch';

const env = {
  contentUrl: process.env.BLOG_CONTENT_URL,
  port: parseInt(process.env.PORT, 10) || 8080,
}

console.log(`Starting server in env: ${JSON.stringify(env, null, 2)}`);

const app = express();

app.use((req, res, next) => {
  console.log(`=> ${req.path}`);
  next();
});

app.get('/content/*', async (req, res, next): Promise<void> => {
  if (!env.contentUrl) {
    next();
    return;
  }
  const url = `${env.contentUrl}/${req.path.replace(/^\/content\//, '')}`
  console.log(`Forwarding content from ${url}`);
  try {
    const response = await fetch(url)
    if (response.status === 200) {
      res.json(await response.json());
    } else {
      res.json({ error: `${response.status}: ${response.statusText}` });
    }
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.use((req, res) => {
  res.send('Hello World!!');
});

app.listen(env.port, () => console.log(`Listening on port ${env.port}!`));

