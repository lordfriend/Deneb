#Web App client for [Albireo](https://github.com/lordfriend/Albireo)

Built with Angular2 using angular2-webpack-starter

###Building requirements

Nodejs 4.0 and above, npm 3 and above

###Development

Clone this repo, install dependencies

```shell
cd Deneb
npm install
```

Copy `config/dev.proxy.js.example` to `config/dev.proxy.js`, If your backend server is running on a different host, you need update the target to your backend host

once npm installation is done, using npm script to run some task, all script can be found in package.json

to start up an dev server, run `npm start` in current directory.

the backend server aka [Albireo](https://github.com/lordfriend/Albireo) server must be started. see the readme of that project.

###Deployment

To deploy on production server, a compiled and minfied bundle is needed, to build this project, just run the following command.

```shell
export SITE_TITLE="Your site name"
export GA="You google analytics Tracking ID" # if you want to use google analytics, export this environment variable.
npm run build:prod
```

After building process finished, you will have a **dist** directory in your project root. copy this project to your static file server.
