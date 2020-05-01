<img src="jups.png" alt="Jups Logo" width="200" />

# jups

A fast, lightweight web framework for [NodeJS](http://nodejs.org).

## Why

There are many different web frameworks for [NodeJS](http://nodejs.org), with some of them more extensive and some more minimal.
This is more of a side project that I deisgned to see if I could use it in REST APIs in the future for personal projects.
It is designed in an extension-forward way, meaning that the main framework has no dependencies and is minimal in functionality,
but is easily extensible with middleware/Object manipulation.

## Features

-   ZERO dependencies!
-   Very fast (similar to [Express](https://github.com/expressjs/express)).
-   Written in Typescript.
    -   Built-in .d.ts files.
    -   Built with strict type checking.
-   In-depth routing.
    -   Supports Regex, strings and combined Regex + strings (e.g '/(home|h)/:name/hello').
    -   Route variable support WITH optional variables.
    -   Note, routing with only Regex nullifies route variables.
-   Support for middleware.
-   Support for subapps for easy route organisation (comparable to the router in [Express](https://github.com/expressjs/express)).
-   Async/await support.

## Installation

```bash
npm i jups
```

## Usage

```js
const jups = require('jups');

jups()
    .use((req, res, next) => {
        res.write('Hello');
        next();
    })
    .get('/', (req, res) => {
        res.end(', world!');
    })
    .listen(3000);
```

For Typescript just use the following import syntax.

```ts
import jups from 'jups';
```

## API

TODO
