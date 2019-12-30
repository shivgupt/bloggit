export const env = {
  contentUrl: process.env.BLOG_CONTENT_URL,
  devMode: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT, 10) || 8080,
}
