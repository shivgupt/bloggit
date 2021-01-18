# Blog

A git-based CMS

To deploy to prod:
- get a server
- run `server-setup` (from bohendo/etc repo)
- add `CI_PROJECT_NAMESPACE` to server's .bashrc
- add `SERVER_URL` and `SSH_KEY` variables to gitlab CI settings
- push to `prod` branch
