import { Jups } from './jups';
import { Request } from './request';
import { Response } from './response';
import { fetchParams } from './utils';
import { fetchMiddleware } from './middleware';
import { handleRoutes, Variable } from './routes';

/**
 * A subapp enables easy organisation of routes by being able to split up specific groups of routes.
 * This is pretty much the `Jups` class except it just stores routes within it without
 * calling the `listen` method.
 */
export interface SubApp {
    /**
     * The original given route for the subapp.
     */
    base: string | RegExp;

    /**
     * The compiled Regex from the base.
     * If the base is Regex, this will match it.
     */
    regex: RegExp;

    /**
     * The compiled variables for the subapp if any is needed.
     */
    variables?: Variable[];

    /**
     * The `Jups` instance of the subapp.
     */
    app: Jups;
}

/**
 * This function handles the routing for the subapps of an app.
 *
 * @param jups The `Jups` instance that contains the subapps.
 * @param req The `Request` object.
 * @param res The `Response` object.
 * @param url The URL for checking for matches.
 */
export function handleSubApps(
    jups: Jups,
    req: Request,
    res: Response,
    url: string
) {
    // Loop through the sub apps.
    for (let i = 0; i < jups.subApps.length; i++) {
        // If instantiated already, just return.
        if (res.instantiated) return;

        let subapp = jups.subApps[i];

        // Check if the base matches.
        let matches = subapp.regex.exec(url);
        if (!matches) continue;

        // Get the parameters.
        if (subapp.variables && subapp.variables?.length) {
            if (!fetchParams(jups, subapp, req, res, matches)) {
                return;
            }
        }

        // Define the new URL to send.
        let sendingUrl = `${
            url.split(`${matches[matches.length - 1]}`)[0].endsWith('/')
                ? '/'
                : ''
        }${matches[matches.length - 1]}`;

        // If there are sub apps, run then first.
        if (subapp.app.subApps.length) {
            handleSubApps(subapp.app, req, res, sendingUrl);
        }

        // Handle middleware.
        if (subapp.app.middlewares.length) {
            fetchMiddleware(subapp.app, req, sendingUrl);
        }

        // Handle routes.
        if (subapp.app.routes.length) {
            handleRoutes(subapp.app, req, res, sendingUrl);
        }
    }
}
