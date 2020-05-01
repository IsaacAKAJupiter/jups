import { ServerResponse, STATUS_CODES } from 'http';

/**
 * The response object that will be used to send the connection some data.
 * This class extends the `ServerResponse` class that Node HTTP library uses by default with servers
 * with new methods and variables to make it cleaner to work with for Jups.
 */
export class Response extends ServerResponse {
    instantiated: boolean = false;

    /**
     * A helper function to modify the status code that the server will send the connection.
     *
     * @param code The HTTP status code to send to the connection.
     * @param message An optional message that will be used alongside the status code. If not given, it will use the default message given by the status code.
     */
    status(code: number, message?: string): this {
        // If invalid status.
        if (!(<Object>STATUS_CODES).hasOwnProperty(code)) {
            throw new Error('Invalid Status');
        }

        // Set code.
        this.statusCode = code;

        // Set the message.
        if (message) this.statusMessage = message;

        // Return the request for chaining.
        return this;
    }
}
