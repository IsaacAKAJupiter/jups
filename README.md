<img src="jups.png" alt="Jups Logo" width="200" />

# jups

[![NPM Version](https://img.shields.io/npm/v/jups.svg)](https://npmjs.org/package/jups)
[![NPM Downloads](https://img.shields.io/npm/dm/jups.svg)](https://npmcharts.com/compare/jups?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=jups)](https://packagephobia.now.sh/result?p=jups)

A fast, lightweight web framework for [NodeJS](http://nodejs.org).

## Why

There are many different web frameworks for [NodeJS](http://nodejs.org), with some of them more extensive and some more minimal.
This is more of a side project that I designed to see if I could use it in REST APIs in the future for personal projects.
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

### Table of Contents

- **[jups (function)](#jups-function)**
- **[Jups (class)](#jups-class)**
    - [Variables](#jups-class-variables)
    - [Methods](#jups-class-methods)
- **[Request (class)](#request)**
    - [Variables](#request-variables)
    - [Methods](#request-methods)
- **[Response (class)](#response)**
    - [Variables](#response-variables)
    - [Methods](#response-methods)
- **[JupsOptions (interface)](#jupsoptions)**
    - [Members](#jupsoptions-members)
- **[Route (interface)](#route)**
    - [Members](#route-members)
- **[Variable (interface)](#variable)**
    - [Members](#variable-members)
- **[SubApp (interface)](#subapp)**
    - [Members](#subapp-members)
- **[Middleware (interface)](#middleware)**
    - [Members](#middleware-members)
- **[Method (type)](#method)**
    - [Values](#method-values)

***

## Jups Function

<code>jups(options)</code>

The default export of jups. It is basically a wrapper of the constructor for the [Jups](#jups-class) class.

- **options** -> [JupsOptions](#jupsoptions)\
    The options to pass to the [Jups](#jups-class) constructor.

This function returns an instance of [Jups](#jups-class).

***

## Jups Class

<code>jups.**Jups**(options)</code>

The main class for the package which allows the framework to function.

- **options** -> [JupsOptions](#jupsoptions)\
    The options for the class to use.

### Jups Class Variables

- **routes** -> [Route](#route)[]\
  An array of routes that the instance is listening on.

- **subApps** -> [SubApp](#subapp)[]\
  An array of subapps that the instance has attached to it.

- **middlewares** -> [Middleware](#middleware)[]\
  An array of middleware that the instance has initialised.

- **_otherwise** -> Function\
  The route that will be called when there are no other routes found.

- **_error** -> Optional[Function]\
  The route that will be called when an error occurs in routes/middleware.

### Jups Class Methods

***

<a href="#Jups.route">¶</a><a name="Jups.route"></a>
<code>**route**(method, route, callback)</code>

- method -> [Method](#method)\
    The method for the route. Will only call the callback whenever it matches the method.
- route -> string | RegExp\
    The route to match for it to call the callback. Can be either a string `'/home'`, a regex `/(home|h)/` or a mixture of string and regex `'/(home|h)'`.
- callback -> Function\
    The function for it to call when it matches. Needs to include [Request](#request) and [Response](#response) parameters.

This method will add a route endpoint handler to the client.

There can be multiple handlers per endpoint as long as the preceding handlers do not end the response.
The route handling is converted to custom regex which then gets checked for matches.

As with most web frameworks, there can be variables within the routes (though currently this is only supported with string routes).

Also, there can also be optional parameters within the route at any point.

This function will return the [Jups](#jups-class) instance to allow chaining.

***

<a href="#Jups.use">¶</a><a name="Jups.use"></a>
<code>**use**(base, ...uses)</code>

- base -> string | RegExp | [Jups](#jups-class) | Function\
    This is the route that has to match for this middleware/subapp to apply. For example, if given `'/players'`, it would only match routes beginning with `/players`. Note, this can also just be middleware/a subapp which would default the base to `/`.
- uses -> Array\<[Jups](#jups-class) | Function\>\
    As many middleware/subapps that you want to apply to this base. You can also mix middleware/subapps if you please.

Tells the instance to use middleware or subapps. Subapps provide an easy way to organise your code. Middleware is called before routes and are usually used to fire the same piece of code for multiple routes following a specific base endpoint.

This function will return the [Jups](#jups-class) instance to allow chaining.

***

<a href="#Jups.otherwise">¶</a><a name="Jups.otherwise"></a>
<code>**otherwise**(callback)</code>

- callback -> Function\
    The callback function that will be called if no other routes were matched.

This method is used for defining a function to be used for the `otherwise` route AKA the `404` route.

Simply put, this function ill be called if no other routes match the request.

This function will return the [Jups](#jups-class) instance to allow chaining.

***

<a href="#Jups.error">¶</a><a name="Jups.error"></a>
<code>**error**(callback)</code>

- callback -> Function\
    The callback function that will be called if there were errors.

This method is used for defining a function to be used incase errors occur during the route listener.

For example if there is an error in the code for a route, this error handler will be called.

Note, this does not catch every single error in your code.

This function will return the [Jups](#jups-class) instance to allow chaining.

***

<a href="#Jups.listen">¶</a><a name="Jups.listen"></a>
<code>**listen**(port = 80, httpsPort = 443)</code>

- port -> number\
    The port to run the app on. Defaults to port 80.
- httpsPort -> number\
    The port to run the app on for SSL/HTTPS. Only needed if using SSL. Defaults to port 443.

This method is for initiating the app to listen for connections. Basically it starts up the server. If you are using SSL, you want to pass it an httpsPort if you do not want to use port 443. This method should be called AFTER defining all of your routes, subapps, and middleware.

This function will return the [Jups](#jups-class) instance to allow chaining.

***

## Request

<code>jups.**Request**()</code>

This is the request class that will get sent with every request that the server will get. It is an extension of the [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage) class that Node HTTP library uses by default with servers with new variables to make it cleaner to work with for Jups.

### Request Variables

- **params** -> Object\
    The URL parameters that got parsed. For example, in the route of `/home/:name`, there would be a parameter of name in params. If the URL was `/home/isaac`, the params object would have `params.name` which would be equal to `isaac`.
- **query** -> Object\
    The URL query parameters from the request. For example, in this URL `https://isaacoram.ca/?id=testing&name=isaac`, the query parameters are `?id=testing&name=isaac` which will get parsed into `query.id` and `query.name`.
- **middlewares** -> [Middleware](#middleware)[]\
    All of the middleware that the URL matched and the request will fire before calling the routes.
- **routes** -> [Route](#route)[]\
    All of the routes that the URL matched and the request will fire after calling all of the middleware.
- **routeErrorHandler** -> Optional[Function]\
    The error callback that will be called if there are any errors that occur. For example, if a function returns an error in a route.

***

## Response

<code>jups.**Response**()</code>

The response object that will be used to send the connection some data. This class extends the [ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse) class that Node HTTP library uses by default with servers with new methods and variables to make it cleaner to work with for Jups.

### Response Variables

- **instantiated** -> boolean\
    Whether or not the response has been instantiated by otherwise or error callbacks.

### Response Methods

<a href="#Response.status">¶</a><a name="Response.status"></a>
<code>**status**(code, message)</code>

- code -> number\
    The HTTP status code to send to the connection.
- message -> Optional[string]\
    An optional message that will be used alongside the status code. If not given, it will use the default message given by the status code.

A helper function to modify the status code that the server will send the connection.

This function can throw an error if the status code is invalid.

This function will return the [Response](#response) instance to allow chaining.

***

## JupsOptions

<code>jups.**JupsOptions**{}</code>

The options that can be passed to the [Jups](#jups-class) class in the constructor.

### JupsOptions Members

- **noOtherwise** -> Optional[boolean]\
    Remove the default otherwise route for the instance.

- **noErrorHandler** -> Optional[boolean]\
    Remove the default error handling route for the instance.

- **ssl** -> Optional[[SSLOptions](#ssloptions)]\
    The SSL options if you want to run the server on HTTPS/SSL.

***

## SSLOptions

<code>jups.**SSLOptions**{}</code>

These options are an extention to the options that are allowed to be passed to `https.createServer`. See [here](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) for more information. Below are the added members to the aforementioned options.

### SSLOptions Members

- **redirect** -> Optional[boolean]\
    If you want the server to automatically redirect connections to the HTTPS version.

***

## Route

<code>jups.**Route**{}</code>

A stored route in the [Jups](#jups-class) instance that contains information to match it and call the callback associated.

### Route Members

- **route** -> string | RegExp\
    The original given route to match.
- **regex** -> RegExp\
    This is either the built regex based on the string given, or the original regex given.
- **variables** -> Optional[[Variable](#variable)[]]\
    The route variables (ones prefixed with a colon).
- **method** -> [Method](#method)\
    The method that the route should match to be able to fire.
- **callback** -> Function\
    The actual function that the route fires if the method and regex match.

***

## Variable

<code>jups.**Variable**{}</code>

All the information stored about a [Route](#route) variable.

### Variable Members

- **index** -> number\
    The path index that the variable is located (at which slash).
- **name** -> string\
    The name of the variable (whatever followed the colon).
- **optional** -> boolean\
    Whether or not the variable is optional (if the variable was followed by a question mark).

***

## SubApp

<code>jups.**SubApp**{}</code>

A subapp enables easy organisation of routes by being able to split up specific groups of routes. This is pretty much the [Jups](#jups-class) class except it just stores routes within it without calling the `listen` method.

### SubApp Members

- **base** -> string | RegExp\
    The original given route for the subapp.
- **regex** -> RegExp\
    The compiled Regex from the base. If the base is Regex, this will match it.
- **variables** -> Optional[[Variable](#variable)[]]\
    The compiled variables for the subapp if any is needed.
- **app** -> [Jups](#jups-class)\
    The [Jups](#jups-class) instance of the subapp.

***

## Middleware

<code>jups.**Middleware**{}</code>

Middleware are simply functions that fire before any of the route callbacks fire. This creates the ability to provide functionality to a bunch of routes without having to implement it in each route callback. Middleware implements the same routing feature as routes.

### Middleware Members

- **route** -> string | RegExp\
    The original given route to match.
- **regex** -> RegExp\
    This is either the built regex based on the string given, or the original regex given.
- **variables** -> Optional[[Variable](#variable)[]]\
    The route variables (ones prefixed with a colon).
- **callback** -> Function\
    The actual function that the middleware fires if the method and regex match.

***

## Method

<code>jups.**Method**{}</code>

All of the HTTP methods that the package supports.

### Method Values

- ALL
- GET
- POST
- HEAD
- PATCH
- PUT
- OPTIONS
- CONNECT
- DELETE
- TRACE
- ACL
- BIND
- CHECKOUT
- COPY
- LINK
- LOCK
- M-SEARCH
- MERGE
- MKACTIVITY
- MKCALENDAR
- MKCOL
- MOVE
- NOTIFY
- PROPFIND
- PROPPATCH
- PURGE
- REBIND
- REPORT
- SEARCH
- SOURCE
- SUBSCRIBE
- UNBIND
- UNLINK
- UNLOCK
- UNSUBSCRIBE