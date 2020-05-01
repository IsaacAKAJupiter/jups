import { IncomingMessage } from 'http';
import { Middleware } from './middleware';
import { RouteCallbackError, Route } from './routes';

/**
 * This is an interface to hold all of the parsed URL parameters.
 */
export interface Params {
    /**
     * This enables Typescript to allow inserting parameters while
     * keeping the strict type checking.
     */
    [key: string]: string;
}

/**
 * This is the request object that will get sent with every request that the server will get.
 * It is an extension of the `IncomingMessage` class that Node HTTP library uses by default with servers
 * with new variables to make it cleaner to work with for Jups.
 */
export class Request extends IncomingMessage {
    /**
     * The URL parameters that got parsed. For example, in the route of `/home/:name`,
     * there would be a parameter of name in params. If the URL was `/home/isaac`, the
     * params object would have `params.name` which would be equal to `isaac`.
     */
    params: Params = {};

    /**
     * The URL query parameters from the request. For example, in this
     * URL `https://isaacoram.ca/?id=testing&name=isaac`, the query parameters
     * are `?id=testing&name=isaac` which will get parsed into `query.id` and `query.name`.
     */
    query: Params = {};

    /**
     * All of the middleware that the URL matched and
     * the request will fire before calling the routes.
     */
    middlewares: Middleware[] = [];

    /**
     * All of the routes that the URL matched and
     * the request will fire after calling all of the middleware.
     */
    routes: Route[] = [];

    /**
     * The error callback that will be called if there are any errors that occur.
     * For example, if a function returns an error in a route.
     */
    routeErrorHandler?: RouteCallbackError;
}
