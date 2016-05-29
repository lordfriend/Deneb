#Web App client for Albireo

Built with Angular2 using angular2-webpack-starter

###Building requirements

Nodejs 4.0 and above, npm 3 and above

###Development

Clone this repo, install dependencies
```shell
cd Deneb
npm install
```

once npm installation is done, using npm script to run some task, all script can be found in package.json

to start up an dev server, run `npm start` in current directory.

There are some modifications need to be done before start up the dev server.
To connect to the backend, a proxy is set in `config/webpack.dev.js` proxy part. modify those ip to your own backend server.

the backend server aka [Albireo](https://github.com/lordfriend/Albireo) server must be started. see the readme of that project.

###Deployment

To deploy on production server, a compiled and minfied bundle is needed, to build this project, just run the following command.

```shell
export SITE_TITLE="Your site name"
npm run build:prod
```

After building process finished, you will have a **dist** directory in your project root. copy this project to your static file server.
