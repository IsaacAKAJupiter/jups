import { Jups } from './jups';
import { Request } from './request';
import { Response } from './response';
import { Variable, Route } from './routes';
import { Middleware } from './middleware';
import { SubApp } from './subapps';

/**
 * This function takes a route and generates variables for easy use for fetching.
 * Note, this function only works with string routes.
 *
 * @param route The route to compile variables for.
 */
export function generateVariables(route: string): Variable[] {
    let variables: Variable[] = [];

    // Get the route/raw params.
    let routeParams = route.split('/');
    routeParams.shift();

    // Loop through the routeParams.
    for (let i = 0; i < routeParams.length; i++) {
        // If the param is a variable.
        if (routeParams[i][0] === ':') {
            let name = routeParams[i].replace(/:(.+?)(\?|$)/, '$1');

            variables.push({
                index: i + 1,
                name,
                optional: routeParams[i][routeParams[i].length - 1] === '?'
            });
        }
    }

    return variables;
}

/**
 * This function gets all of the route parameters for a request from the compiled variables.
 * For example, a route of `/home/:name/hello` would fetch the :name parameter from the URL.
 *
 * @param jups The `Jups` instance.
 * @param route The route/middleware/subapp to get the params for (subapp/middleware are where they are applied).
 * @param req The request Object.
 * @param res The response Object.
 * @param matches The Regex matches for URL.
 */
export function fetchParams(
    jups: Jups,
    route: Route | Middleware | SubApp,
    req: Request,
    res: Response,
    matches: RegExpExecArray
): boolean {
    if (!route.variables) return false;

    // Loop through the compiled variables.
    for (let i = 0; i < route.variables.length; i++) {
        // If the match is not undefined, set it.
        if (matches[route.variables[i].index]) {
            // Decode the URI characters and remove slashes.
            try {
                req.params[route.variables[i].name] = decodeURIComponent(
                    matches[route.variables[i].index].replace(/\//g, '')
                );
            } catch (e) {
                // If there is an error, set instantiated to true and the route to undefined to stop route execution.
                res.instantiated = true;
                req.routes = [];

                // Send it to the route handler if there are any.
                if (req.routeErrorHandler) {
                    req.routeErrorHandler(req, res, e);
                } else if (jups._error) {
                    jups._error(req, res, e);
                }

                return false;
            }
        }
    }

    return true;
}
