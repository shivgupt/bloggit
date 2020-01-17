export const env = {
  contentUrl: process.env.REACT_APP_CONTENT_URL
    ? process.env.REACT_APP_CONTENT_URL.replace(/\/$/, "")
    : undefined,
};
