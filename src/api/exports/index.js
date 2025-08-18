// src/api/exports/index.js
import ExportsHandler from './handler.js';
import routes from './routes.js';

const exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { producerService, playlistsService, validator }) => {
    const exportsHandler = new ExportsHandler(producerService, playlistsService, validator);
    server.route(routes(exportsHandler));
  },
};

export default exports;