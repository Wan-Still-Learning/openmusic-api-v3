import PlaylistsHandler from './handler.js';
import routes from './routes.js';

const playlists = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service, songsService, validator }) => {
    const playlistsHandler = new PlaylistsHandler(service, songsService, validator);
    server.route(routes(playlistsHandler));
  },
};

export default playlists;