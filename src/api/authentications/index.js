import AuthenticationsHandler from './handler.js';
import routes from './routes.js';

const authentications = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    usersService,
    authenticationsService,
    tokenManager,
    validator,
  }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      usersService,
      authenticationsService,
      tokenManager,
      validator,
    );
    server.route(routes(authenticationsHandler));
  },
};

export default authentications;