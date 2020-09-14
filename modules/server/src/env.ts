export const env = {
  contentUrl: process.env.BLOG_CONTENT_URL,
  devMode: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT, 10) || 8080,
  db: {
    host: process.env.POSTGRES_HOST,
    name: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
  }
}
