import AlbumsHandler from './handler.js';
import routes from './routes.js';

const albums = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator, storageService }) => {
    const albumsHandler = new AlbumsHandler(service, validator, storageService);
    server.route(routes(albumsHandler));
  },
};

export default albums;