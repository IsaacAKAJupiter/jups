import { Jups, Method } from './jups';
import { Request } from './request';
import { Response } from './response';
import { fetchParams } from './utils';

export interface Variable {
    index: number;
    name: string;
    optional: boolean;
}

export interface RouteRegex {
    route: string | RegExp;
    regex: RegExp;
    variables?: Variable[];
}

export interface Route extends RouteRegex {
    method: Method;
    callback: RouteCallback;
}

export type RouteCallback = (req: Request, res: Response) => void;

export type RouteCallbackError = (
    req: Request,
    res: Response,
    err: Error
) => void;

export type RouteFunction = (
    route: string | RegExp,
    callback: RouteCallback
) => Jups;

/**
 * This function gets all of the matching routes for a `Jups` instance. This will also be called for all subapps.
 * This will also fetch the correct `otherwise` and `error` callbacks.
 *
 * @param jups The `Jups` instance to handle the routes on. This could also be a subapp `Jups` instance.
 * @param req The `Request` object.
 * @param res The `Response` object.
 * @param url The URL to check for Regex matches.
 */
export function handleRoutes(
    jups: Jups,
    req: Request,
    res: Response,
    url: string
) {
    if (res.instantiated) return;

    // Loop through the routes.
    for (let i = 0; i < jups.routes.length; i++) {
        // Get the current route.
        let route = jups.routes[i];

        // Check for incorrect method.
        if (route.method !== req.method && route.method !== 'ALL') continue;

        // Check regex for match.
        let matches = route.regex.exec(url);
        if (!matches) continue;

        // Get the route params.
        if (route.variables && route.variables.length) {
            if (!fetchParams(jups, route, req, res, matches)) return;
        }

        // If passed all those, save the callback and error handler.
        req.routes.push(route);
        if (jups._error) req.routeErrorHandler = jups._error;
    }

    // If no routes were called, call the otherwise callback.
    if (jups._otherwise && !req.routes.length) {
        jups._otherwise(req, res);
        res.instantiated = true;
    }
}

/**
 * This function generates the needed Regex for string routes. It handles URL variables,
 * wildcards, groups accordingly, and makes it very simple to work with for handling incoming
 * connections.
 *
 * @param route The route to generate the regex on. Only string routes are supported.
 * @param base If the route to generate has a base (basically anything that the `use` method receives).
 */
export function generateRouteRegex(
    route: string,
    base: boolean = false
): RegExp {
    // Variables for string interpolation.
    let leadingSlash = route[route.length - 1] === '/' ? '' : '/?';
    let baseSuffix = base ? '(.*)' : '';

    // Generate the regex with regex replace and string interpolation.
    return new RegExp(
        `^${
            route
                .replace(/\*/g, '.+') // Handle wildcards.
                .replace(/\/([0-9a-zA-Z]+)/g, '/($1)') // Add group to normal params.
                .replace(/:.+?(\?)?(\/|$)/g, '([^/]+$2)$1') // Replace the variables to work with any text.
        }${leadingSlash}${baseSuffix}$`
    );
}
