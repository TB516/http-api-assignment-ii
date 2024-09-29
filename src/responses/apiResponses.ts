import { IncomingMessage, ServerResponse } from 'http';
import { User } from './User';
import { ErrorMessage } from './ErrorMessage';
import { Users } from './Users';

const users: Users = {};

const getUsers = (request: IncomingMessage, response: ServerResponse) => {
  const json = JSON.stringify(users);

  response.writeHead(200, 'Success', {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json, 'utf8'),
  });

  if (request.method !== 'HEAD') { response.write(json); }

  return response.end();
};

const notFound = (
  request: IncomingMessage,
  response: ServerResponse,
  errMessage?: ErrorMessage,
) => {
  const message = JSON.stringify(errMessage);

  response.writeHead(404, 'Not Found', {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(message, 'utf8'),
  });

  if (request.method !== 'HEAD') { response.write(message); }

  return response.end();
};

// eslint-disable-next-line arrow-body-style
const pageNotFound = (request: IncomingMessage, response: ServerResponse) => {
  return notFound(request, response, { id: 'notFound', message: 'The page you are looking for was not found.' } as ErrorMessage);
};

const badRequest = (
  request: IncomingMessage,
  response: ServerResponse,
  errMessage: ErrorMessage,
) => {
  const message = JSON.stringify(errMessage);

  response.writeHead(400, 'Bad Request', {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(message, 'utf8'),
  });

  if (request.method !== 'HEAD') { response.write(message); }

  return response.end();
};

const updateUser = (
  request: IncomingMessage,
  response: ServerResponse,
  incomingUser: User,
) => {
  users[incomingUser.name].age = incomingUser.age;
  users[incomingUser.name].times!.lastUpdated = Date.now();

  response.writeHead(204, 'Updated');
  return response.end();
};

const addUser = (request: IncomingMessage, response: ServerResponse) => {
  // Using query params because getting a body out of an incoming message is giving me a stroke
  const params = new URL(`https://${request.headers.host}${request.url!}`).searchParams;
  const incomingUser = { name: params.get('name'), age: Number.parseInt(params.get('age')!, 10) } as User;

  if (incomingUser.name === '' || Number.isNaN(incomingUser.age)) {
    return badRequest(request, response, {
      id: 'addUserMissingParams',
      message: 'Name and age are both required.',
    } as ErrorMessage);
  }

  if (users[incomingUser.name]) {
    return updateUser(request, response, incomingUser);
  }

  incomingUser.times = {
    created: Date.now(),
    lastUpdated: Date.now(),
  };
  users[incomingUser.name] = incomingUser;

  const message = JSON.stringify({ message: 'Created Successfully' });

  response.writeHead(201, 'Created', {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(message, 'utf8'),
  });

  response.write(message);

  return response.end();
};

export {
  getUsers,
  notFound,
  pageNotFound,
  addUser,
};
