# Web App client for [Albireo](https://github.com/lordfriend/Albireo)

## Building requirements

Nodejs 7.0 and above, npm 3 and above, Yarn (I recommend this package manager to manage npm packages)

## Development

Clone this repo, install dependencies

```shell
cd Deneb
yarn install
```

Copy `config/dev.proxy.js.example` to `config/dev.proxy.js`, If your backend server is running on a different host, you need update the target to your backend host

once npm installation is done, using npm script to run some task, all script can be found in package.json

to start up an dev server, run `npm start` in current directory.

the backend server aka [Albireo](https://github.com/lordfriend/Albireo) server must be started. see the readme of that project.

## Deployment

To deploy on production server, a compiled and minfied bundle is needed, to build this project, just run the following command.

```shell
export SITE_TITLE="Your site name"
export GA="You google analytics Tracking ID" # if you want to use google analytics, export this environment variable.
npm run build:aot:prod
```

After building process finished, you will have a **dist** directory in your project root. copy this project to your static file server.

### Nginx Configuration for SPA

To support SPA which using HTML5 History API. there are a little configuration need be done in Nginx or other your HTTP static server. Here we will
demonstrate with Nginx.

You can also see other reference for this common case: [https://www.linkedin.com/pulse/decouple-your-single-page-app-from-backend-nginx-tom-bray](https://www.linkedin.com/pulse/decouple-your-single-page-app-from-backend-nginx-tom-bray)

You need fallback all request except the path start with /api to /index.html which will make the SPA be able to handle the route in browser.

```
location / {
    try_files $uri $uri/ /index.html;
}

# Proxy requests to "/auth" and "/api" to the server.
location /api {
    proxy_pass http://application_upstream;
    proxy_redirect off;
}
```