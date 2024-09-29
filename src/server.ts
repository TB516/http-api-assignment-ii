import http, { IncomingMessage, ServerResponse } from 'http';
import { getIndexCss, getIndexHtml } from './responses/htmlResponses';
import {
  addUser, getUsers, pageNotFound,
} from './responses/apiResponses';

// eslint-disable-next-line no-unused-vars, max-len
type ResponseMethod = (arg1: IncomingMessage, arg2: ServerResponse) => void;

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const routes: Record<string, ResponseMethod> = {
  '/': getIndexHtml,
  '/style.css': getIndexCss,
  '/getUsers': getUsers,
  '/addUser': addUser,
  '/notReal': pageNotFound,
};

const onRequest = (request: IncomingMessage, response: ServerResponse) => {
  const parsedUrl = new URL(request.url!, `https://${request.headers.host}`);

  if (routes[parsedUrl.pathname]) {
    return routes[parsedUrl.pathname](request, response);
  }

  return routes['/notReal'](request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on port:${port}`);
});
