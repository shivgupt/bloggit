import express from 'express';
import path from 'path';

import { env } from './env';
import { content } from './content';

console.log(`Starting server in env: ${JSON.stringify(env, null, 2)}`);

const app = express();

app.use((req, res, next) => {
  console.log(`=> ${req.path}`);
  next();
});

app.use('/content', content);

app.use((req, res) => {
  console.log(`404: Hello World!!`);
  res.status(404).send('Hello World!!');
});

app.listen(env.port, () => console.log(`Listening on port ${env.port}!`));

