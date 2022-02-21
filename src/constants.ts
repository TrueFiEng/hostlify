export const PORT = 8080
export const HOST = '0.0.0.0'

export const SERVER_TEMPLATE = `server {
    listen       80;
    listen  [::]:80;
    server_name  {{serverName}}.lvh.me;

    location / {
        root   /usr/share/nginx/html/{{serverName}};
        index  index.html index.htm;
    }

    error_page 404 500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
`
