import { Jups } from './jups';
import { Request } from './request';
import { Response } from './response';
import { RouteRegex } from './routes';

export type NextCallback = (error?: string | Error) => void;

export interface Middleware extends RouteRegex {
    callback: MiddlewareCallback;
}

export type MiddlewareCallback = (
    req: Request,
    res: Response,
    next: NextCallback
) => void;

/**
 * This function fetches all of the matching middleware from a `Jups` instance.
 * This will also work with subapps.
 *
 * @param jups The `Jups` instance to check if any of the middleware match.
 * @param req The `Request` object.
 * @param url The URL that the middleware will be matched against.
 */
export function fetchMiddleware(jups: Jups, req: Request, url: string) {
    // Loop through the middlewares.
    for (let i = 0; i < jups.middlewares.length; i++) {
        // Check regex for match.
        if (jups.middlewares[i].regex.exec(url)) {
            req.middlewares.push(jups.middlewares[i]);
        }
    }
}

/**
 * This function handles firing all the middleware on the `Request` object.
 * Middleware works with async functions as well as non-async functions.
 *
 * @param req The `Request` object.
 * @param res The `Response` object.
 */
export function handleMiddleware(req: Request, res: Response) {
    return new Promise(async (resolve, reject) => {
        let next: NextCallback = async (error?: string | Error) => {
            if (res.writableEnded) {
                resolve();
                return;
            }

            // If there is an error given.
            if (error && req.routeErrorHandler) {
                await Promise.resolve(
                    req.routeErrorHandler(
                        req,
                        res,
                        error instanceof Error ? error : new Error(error)
                    )
                );

                // If the error handler did not end the response, end it.
                if (!res.writableEnded) res.end();
                return;
            }

            // Pop the middleware.
            req.middlewares.shift();

            // Check if there are middlewares left.
            if (req.middlewares.length > 0 && !res.writableEnded) {
                await fireMiddleware();
            } else {
                resolve();
            }
        };

        let fireMiddleware = async () => {
            try {
                await Promise.resolve(
                    req.middlewares[0].callback(req, res, next)
                );
            } catch (e) {
                // If an error occurs, call the error handler if needed.
                if (req.routeErrorHandler) {
                    await Promise.resolve(req.routeErrorHandler(req, res, e));
                }
            }
        };

        // Fire middleware.
        await fireMiddleware();
    });
}
