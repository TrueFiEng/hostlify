Building multi-arch docker image:

```
docker buildx build --platform=linux/amd64,linux/arm64 -t ghcr.io/ethworks/hostlify --push .
```