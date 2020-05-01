import { Response } from './response';
import { Request } from './request';
import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import { createServer as sCreateServer, Server as SServer } from 'https';
import { TlsOptions } from 'tls';
import {
    fetchMiddleware,
    MiddlewareCallback,
    Middleware,
    handleMiddleware
} from './middleware';
import { handleSubApps, SubApp } from './subapps';
import {
    RouteCallback,
    RouteCallbackError,
    generateRouteRegex,
    Route,
    RouteFunction,
    handleRoutes
} from './routes';
import { generateVariables } from './utils';

/**
 * An alias for calling the constructor for the `Jups` class.
 *
 * Creates an instance of the `Jups` class that will be used for handling the entire HTTP
 * framework backend. This will be the class that you call methods like `route` and `listen`.
 *
 * @param options - The options for the instance.
 */
function jups(options?: jups.JupsOptions) {
    return new jups.Jups(options);
}

namespace jups {
    // Define enums for supported methods.
    export type Method =
        | 'ALL'
        | 'GET'
        | 'POST'
        | 'HEAD'
        | 'PATCH'
        | 'PUT'
        | 'OPTIONS'
        | 'CONNECT'
        | 'DELETE'
        | 'TRACE'
        | 'ACL'
        | 'BIND'
        | 'CHECKOUT'
        | 'COPY'
        | 'LINK'
        | 'LOCK'
        | 'M-SEARCH'
        | 'MERGE'
        | 'MKACTIVITY'
        | 'MKCALENDAR'
        | 'MKCOL'
        | 'MOVE'
        | 'NOTIFY'
        | 'PROPFIND'
        | 'PROPPATCH'
        | 'PURGE'
        | 'REBIND'
        | 'REPORT'
        | 'SEARCH'
        | 'SOURCE'
        | 'SUBSCRIBE'
        | 'UNBIND'
        | 'UNLINK'
        | 'UNLOCK'
        | 'UNSUBSCRIBE';

    export interface SSLOptions extends TlsOptions {
        redirect?: boolean;
    }

    export interface JupsOptions {
        noOtherwise?: boolean;
        noErrorHandler?: boolean;
        ssl?: SSLOptions;
    }

    export class Jups {
        // Main variables.
        private _server: Server;
        private _sserver?: SServer;
        public routes: Route[] = [];
        public subApps: SubApp[] = [];
        public middlewares: Middleware[] = [];
        public _otherwise?: RouteCallback;
        public _error?: RouteCallbackError;

        // Method function variables.
        all: RouteFunction;
        get: RouteFunction;
        post: RouteFunction;
        head: RouteFunction;
        patch: RouteFunction;
        options: RouteFunction;
        connect: RouteFunction;
        delete: RouteFunction;
        trace: RouteFunction;
        put: RouteFunction;
        acl: RouteFunction;
        bind: RouteFunction;
        checkout: RouteFunction;
        copy: RouteFunction;
        link: RouteFunction;
        lock: RouteFunction;
        msearch: RouteFunction;
        merge: RouteFunction;
        mkactivity: RouteFunction;
        mkcalendar: RouteFunction;
        mkcol: RouteFunction;
        move: RouteFunction;
        notify: RouteFunction;
        propfind: RouteFunction;
        proppatch: RouteFunction;
        purge: RouteFunction;
        rebind: RouteFunction;
        report: RouteFunction;
        search: RouteFunction;
        source: RouteFunction;
        subscribe: RouteFunction;
        unbind: RouteFunction;
        unlink: RouteFunction;
        unlock: RouteFunction;
        unsubscribe: RouteFunction;

        /**
         * Creates an instance of the `Jups` class that will be used for handling the entire HTTP
         * framework backend. This will be the class that you call methods like `route` and `listen`.
         *
         * @param options - The options for the instance.
         * @returns The new instance for chaining purposes.
         */
        constructor(options: JupsOptions = {}) {
            // Create the listener for the HTTP server based on if there is SSL and if the SSL has redirect on it.
            let listener: (req: IncomingMessage, res: ServerResponse) => void;
            if (!options.ssl || !options.ssl.redirect) {
                listener = (req: IncomingMessage, res: ServerResponse) =>
                    this._listener(<Request>req, <Response>res);
            } else {
                listener = (req: IncomingMessage, res: ServerResponse) => {
                    res.setHeader(
                        'Location',
                        `https://${req.headers.host}${req.url}`
                    );
                    res.statusCode = 302;
                };
            }

            // Create the server.
            this._server = createServer(
                { ServerResponse: Response, IncomingMessage: Request },
                listener
            );

            // If given SSL.
            if (options.ssl) {
                this._sserver = sCreateServer(
                    {
                        ServerResponse: Response,
                        IncomingMessage: Request,
                        ...options.ssl
                    },
                    (req, res) => {
                        this._listener(<Request>req, <Response>res);
                    }
                );
            }

            // Set the default otherwise if needed.
            if (!options.noOtherwise) {
                this._otherwise = (req, res) => res.status(404).end();
            }

            // Set the default error handler if needed.
            if (!options.noErrorHandler) {
                this._error = (req, res, err) => res.status(500).end(err);
            }

            // Create all of the http method functions.
            this.all = <RouteFunction>this.route.bind(this, 'ALL');
            this.get = <RouteFunction>this.route.bind(this, 'GET');
            this.head = <RouteFunction>this.route.bind(this, 'HEAD');
            this.patch = <RouteFunction>this.route.bind(this, 'PATCH');
            this.options = <RouteFunction>this.route.bind(this, 'OPTIONS');
            this.connect = <RouteFunction>this.route.bind(this, 'CONNECT');
            this.delete = <RouteFunction>this.route.bind(this, 'DELETE');
            this.trace = <RouteFunction>this.route.bind(this, 'TRACE');
            this.post = <RouteFunction>this.route.bind(this, 'POST');
            this.put = <RouteFunction>this.route.bind(this, 'PUT');
            this.acl = <RouteFunction>this.route.bind(this, 'ACL');
            this.bind = <RouteFunction>this.route.bind(this, 'BIND');
            this.checkout = <RouteFunction>this.route.bind(this, 'CHECKOUT');
            this.copy = <RouteFunction>this.route.bind(this, 'COPY');
            this.link = <RouteFunction>this.route.bind(this, 'LINK');
            this.lock = <RouteFunction>this.route.bind(this, 'LOCK');
            this.msearch = <RouteFunction>this.route.bind(this, 'M-SEARCH');
            this.merge = <RouteFunction>this.route.bind(this, 'MERGE');
            this.mkcol = <RouteFunction>this.route.bind(this, 'MKCOL');
            this.move = <RouteFunction>this.route.bind(this, 'MOVE');
            this.notify = <RouteFunction>this.route.bind(this, 'NOTIFY');
            this.propfind = <RouteFunction>this.route.bind(this, 'PROPFIND');
            this.proppatch = <RouteFunction>this.route.bind(this, 'PROPPATCH');
            this.purge = <RouteFunction>this.route.bind(this, 'PURGE');
            this.rebind = <RouteFunction>this.route.bind(this, 'REBIND');
            this.report = <RouteFunction>this.route.bind(this, 'REPORT');
            this.search = <RouteFunction>this.route.bind(this, 'SEARCH');
            this.source = <RouteFunction>this.route.bind(this, 'SOURCE');
            this.subscribe = <RouteFunction>this.route.bind(this, 'SUBSCRIBE');
            this.unbind = <RouteFunction>this.route.bind(this, 'UNBIND');
            this.unlink = <RouteFunction>this.route.bind(this, 'UNLINK');
            this.unlock = <RouteFunction>this.route.bind(this, 'UNLOCK');
            this.mkactivity = <RouteFunction>(
                this.route.bind(this, 'MKACTIVITY')
            );
            this.mkcalendar = <RouteFunction>(
                this.route.bind(this, 'MKCALENDAR')
            );
            this.unsubscribe = <RouteFunction>(
                this.route.bind(this, 'UNSUBSCRIBE')
            );
        }

        /**
         * This method will add a route endpoint handler to the client.
         *
         * There can be multiple handlers per endpoint as long as the preceding handlers do not end the response.
         * The route handling is converted to custom regex which then gets checked for matches.
         *
         * As with most web frameworks, there can be variables within the routes (though currently this is only supported with string routes).
         * Also, there can also be optional parameters within the route at any point.
         *
         * The accepted methods are as follows:
         * `ALL`, `GET`, `POST`, `HEAD`, `PATCH`, `PUT`, `OPTIONS`, `CONNECT`, `DELETE`, `TRACE`, `ACL`, `BIND`, `CHECKOUT`, `COPY`, `LINK`, `LOCK`,
         * `M-SEARCH`, `MERGE`, `MKACTIVITY`, `MKCALENDAR`, `MKCOL`, `MOVE`, `NOTIFY`, `PROPFIND`, `PROPPATCH`, `PURGE`, `REBIND`, `REPORT`,
         * `SEARCH`, `SOURCE`, `SUBSCRIBE`, `UNBIND`, `UNLINK`, `UNLOCK`, and `UNSUBSCRIBE`.
         *
         * @param method - The method for the route. Will only call the callback whenever it matches the method.
         * @param route - The route to match for it to call the callback. Can be either a string `'/home'`, a regex `/(home|h)/` or a mixture of string and regex `'/(home|h)'`
         * @param callback - The function for it to call when it matches. Needs to include `Request` and `Response` parameters.
         * @returns The same class to allow chaining.
         *
         * ```ts
         *      jups()
         *              .route('PUT', '/', (req, res) => {
         *                  res.end('Welcome to the home page!');
         *              })
         *              .route('GET', /\/(get|g)/, async (req, res) => {
         *                  res.end('This also works with async functions!');
         *              })
         *              .route('POST', 'post/(name|n)/:name/:id?', (req, res) => {
         *                  console.log(req.params);
         *                  res.end('This contains a mix of the string-regex as well as parameters and optional parameters.');
         *              })
         *              .listen();
         * ```
         */
        route(method: Method, route: string, callback: RouteCallback): this;
        route(method: Method, route: RegExp, callback: RouteCallback): this;
        route(
            method: Method,
            route: string | RegExp,
            callback: RouteCallback
        ): this {
            // Set the regex of the route.
            let regex;
            let variables;
            if (route instanceof RegExp) {
                regex = route;
            } else {
                // Make sure it starts with a /.
                if (!route.startsWith('/')) route = `/${route}`;

                // If the route is a string, generate regex from it.
                regex = generateRouteRegex(route);

                // Generate the variables.
                variables = generateVariables(route);
            }

            // Push the route and then return the class for chaining.
            this.routes.push({ method, route, regex, callback, variables });
            return this;
        }

        /**
         * Tells the `Jups` instance to use middleware or subapps. Subapps provide an easy way to organise your code.
         * Middleware is called before routes and are usually used to fire the same piece of code
         * for multiple routes following a specific base endpoint.
         *
         * @param base - This is the route that has to match for this middleware/subapp to apply.
         *               For example, if given `'/players'`, it would only match routes beginning with `/players`.
         *               Note, this can also just be middleware/a subapp which would default the base to `/`.
         * @param uses - As many middleware/subapps that you want to apply to this base. You can also mix
         *               middleware/subapps if you please.
         * @returns The same class to allow chaining.
         *
         * ```ts
         *      jups()
         *              // This use would match any route (this is a JSON middleware).
         *              .use('/', (req, res, next) => {
         *                  res.setHeader('content-type', 'application/json; charset=utf-8');
         *                  next();
         *              })
         *              // Again, this would match any route since not given a base (which then defaults to `/`).
         *              .use(async (req, res, next) => {
         *                  req.params.middleware = 2;
         *                  next();
         *              })
         *              .get('/', (req, res) => {
         *                  // This will call the first
         *                  res.end(JSON.stringify({ response: 'Testing' }));
         *              )}
         *              .listen();
         * ```
         */
        use(base: Jups, ...uses: Jups[]): this;
        use(base: MiddlewareCallback, ...uses: Jups[]): this;
        use(base: Jups | MiddlewareCallback, ...uses: Jups[]): this;
        use(base: string, ...uses: Jups[]): this;
        use(base: RegExp, ...uses: Jups[]): this;
        use(base: MiddlewareCallback, ...uses: MiddlewareCallback[]): this;
        use(base: Jups, ...uses: MiddlewareCallback[]): this;
        use(
            base: Jups | MiddlewareCallback,
            ...uses: MiddlewareCallback[]
        ): this;
        use(base: string, ...uses: MiddlewareCallback[]): this;
        use(base: RegExp, ...uses: MiddlewareCallback[]): this;
        use(
            base: MiddlewareCallback,
            ...uses: Array<MiddlewareCallback | Jups>
        ): this;
        use(base: Jups, ...uses: Array<MiddlewareCallback | Jups>): this;
        use(
            base: Jups | MiddlewareCallback,
            ...uses: Array<MiddlewareCallback | Jups>
        ): this;
        use(base: string, ...uses: Array<MiddlewareCallback | Jups>): this;
        use(base: RegExp, ...uses: Array<MiddlewareCallback | Jups>): this;
        use(
            base?: string | RegExp | Jups | MiddlewareCallback,
            ...uses: Array<Jups | MiddlewareCallback>
        ): this {
            // If no base is found.
            if (base instanceof Jups || typeof base === 'function') {
                uses.push(base);
                base = '/';
            }

            // If there is no jups instance.
            if (!uses.length) {
                console.trace('WARNING: Missing instance of Jups.');
                return this;
            }

            // If there is no base.
            if (!base) {
                console.trace('WARNING: Missing base.');
                return this;
            }

            // Generate the route regex.
            let regex =
                base instanceof RegExp ? base : generateRouteRegex(base, true);

            // Generate the variables.
            let variables =
                base instanceof RegExp ? undefined : generateVariables(base);

            // Push the sub app(s).
            for (let i = 0; i < uses.length; i++) {
                if (uses[i] instanceof Jups) {
                    this.subApps.push({
                        regex,
                        base,
                        app: <Jups>uses[i],
                        variables
                    });
                } else {
                    this.middlewares.push({
                        regex,
                        route: base,
                        callback: <MiddlewareCallback>uses[i],
                        variables
                    });
                }
            }

            return this;
        }

        /**
         * This method is used for defining a function to be used for the `otherwise` route AKA
         * the `404` route.
         *
         * Simply put, this function ill be called if no other routes match the request.
         *
         * @param callback - The callback function that will be called if no other routes were matched.
         * @returns The same class to allow chaining.
         *
         * ```ts
         *      jups()
         *              // Since there are no routes to match, it will always hit this otherwise endpoint.
         *              .otherwise((req, res) => {
         *                  res.status(404).end();
         *              })
         *              .listen();
         * ```
         */
        otherwise(callback: RouteCallback): this {
            this._otherwise = callback;
            return this;
        }

        /**
         * This method is used for defining a function to be used incase errors occur during
         * the route listener.
         *
         * For example if there is an error in the code for a route, this error handler will be called.
         *
         * Note, this does not catch every single error in your code.
         *
         * @param callback - The callback function that will be called if there were errors.
         * @returns The same class to allow chaining.
         *
         * ```ts
         *      jups()
         *              // This get will error, calling the status.
         *              .get('/', (req, res) => req.endnd())
         *              .error((req, res) => {
         *                  res.status(500).end();
         *              })
         *              .listen();
         * ```
         */
        error(callback: RouteCallbackError): this {
            this._error = callback;
            return this;
        }

        /**
         * This method is for initiating the app to listen for connections. Basically it starts up the server.
         * If you are using SSL, you want to pass it an httpsPort if you do not want to use port 443.
         * This method should be called AFTER defining all of your routes, subapps, and middleware.
         *
         * @param port The port to run the app on. Defaults to port 80.
         * @param httpsPort The port to run the app on for SSL/HTTPS. Only needed if using SSL. Defaults to port 443.
         */
        listen(port: number = 80, httpsPort: number = 443): this {
            // Listen on the given port.
            this._server.listen(port);
            if (this._sserver) this._sserver.listen(httpsPort);
            return this;
        }

        private async _listener(req: Request, res: Response) {
            if (!req.url) return;

            // Get the query params by looping through the regex matches.
            let regex = /(?:\?|&|;)([^=]+)=([^&|;]+)/g;
            let matches: RegExpExecArray | null;
            while ((matches = regex.exec(req.url)) !== null) {
                req.query[matches[1]] = matches[2];
            }

            // Update the url without the query params.
            let url = req.url.replace(regex, '');

            // Handle the subapps, middleware, and routes.
            if (this.subApps.length) handleSubApps(this, req, res, url);
            if (this.middlewares.length) fetchMiddleware(this, req, url);
            if (this.routes.length) handleRoutes(this, req, res, url);

            // If we do not have a route (we ran into an otherwise function).
            if (!req.routes.length) {
                if (res.instantiated) return;

                if (this._otherwise) this._otherwise(req, res);
            }

            if (req.middlewares.length) await handleMiddleware(req, res);

            for (let i = 0; i < req.routes.length; i++) {
                // Make sure the response has not ended then fire try to fire the callback (also catch errors).
                if (res.writableEnded) return;

                try {
                    await Promise.resolve(req.routes[i].callback(req, res));
                } catch (e) {
                    if (req.routeErrorHandler) {
                        await Promise.resolve(
                            req.routeErrorHandler(req, res, e)
                        );
                    }
                }
            }
        }
    }
}

export = jups;
