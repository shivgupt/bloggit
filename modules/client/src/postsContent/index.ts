import { PostData } from '../types';

export const cryptoHelloWorld: PostData = {
  slug: 'crypto-hello-world',
  path: require('./crypto-hello-world.md'),
  tags: ['cryto', 'economics'],
  tldr: "This is short discription of crypto post",
  title: "Crypto 101 Post",
}
export const politicsHelloWorld: PostData = {
  slug: 'politics-hello-world',
  path: require('./politics-hello-world.md'),
  tags: ['politics', 'economics'],
  tldr: "This is short discription of politics post",
  title: "Politics 101 Post",
}
// export const politicsHelloWorld = require('./politics-hello-world.md');
