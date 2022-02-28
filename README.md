# Hostlify

Self-hosted site preview service.

> 🏢 Self-hosted.
> 
> 👌 Easy to set-up.
> 
> 🚀 Blazing fast deploy.
> 
> 🔗 Integrates into your existing CI pipeline.


## Set-up

With docker-compose:

```yaml
version: '3.7'

services:
  hostlify:
    image: ghcr.io/ethworks/hostlify:latest
    ports:
      - 80:80
```

Or with docker CLI:

```bash
docker start --name hostlify -p 80:80 ghcr.io/ethworks/hostlify:latest
```

## Deploying the previews

Add the [github action](https://github.com/ethworks/hostlify-publish) to your CI pipeline:

```yaml
- name: Build web app
  run: yarn build
  
  # Insert this after your build step
- uses: ethworks/hostlify-publish@v3.7
  with:
    files: ./build # Directory with the build output 
    server-url: your.preview.server.org # Url to the deployed hosting backend
    owner: your-org # Owner of your organization/account on github.
    repo: your-repo # Name of your repo.
    access-token: ${{ secrets.GITHUB_TOKEN }}
```

### FAQ

Building multi-arch docker image:

```
docker buildx build --platform=linux/amd64,linux/arm64 -t ghcr.io/ethworks/hostlify --push .
```
