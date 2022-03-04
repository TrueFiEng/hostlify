export const SERVER_TEMPLATE = `server {
    listen       80;
    listen  [::]:80;
    server_name  {{serverName}}.{{domain}};

    location / {
        root   /usr/share/nginx/html/{{serverName}};        
        try_files $uri $uri/ $uri.html /index.html;
        autoindex on;
    }

    error_page 404 500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
`

export const NGINX_TEMPLATE = `user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    default_type  application/octet-stream;
    include /etc/nginx/mime.types;
    client_max_body_size 100000M;
    charset utf-8;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;

    keepalive_timeout  65;

    server {
        listen 80 ;
        listen [::]:80;        
        client_max_body_size 100000M;
        
        server_name {{domain}};

        error_page 400 401 402 403 404 405 500 502 503 504  /50x.html;
        location / {
                proxy_http_version 1.1;
                proxy_cache_bypass $http_upgrade;

                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;

                proxy_pass http://0.0.0.0:8080/;
        }
    }

    include /etc/nginx/serverConfigs/*;

}
`
