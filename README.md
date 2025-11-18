# ContactsApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.6.

## Development server

To start a local development server, run:


```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.


## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Building and Starting for PWA offline mode 

PWA development setup uses http-server package 

run if http-server is not intstalled 

```bash
npm install http-server -g
```

run 

```bash
ng build --configuration production
```

then run 

```bash
npm run start:pwa
```


## TODO

alerts and loaders on offline actions 

fix service worker caching issue and contact task queue issue (undefined)