// src/server.js
import 'dotenv/config';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import Inert from '@hapi/inert';

// Plugins
import albums from './api/albums/index.js';
import songs from './api/songs/index.js';
import users from './api/users/index.js';
import authentications from './api/authentications/index.js';
import playlists from './api/playlists/index.js';
import collaborations from './api/collaborations/index.js';
import exports from './api/exports/index.js';
import likes from './api/likes/index.js';

// Services
import AlbumsService from './services/postgres/AlbumsService.js';
import SongsService from './services/postgres/SongsService.js';
import UsersService from './services/postgres/UsersService.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';
import PlaylistsService from './services/postgres/PlaylistsService.js';
import CollaborationsService from './services/postgres/CollaborationsService.js';
import ProducerService from './services/rabbitmq/ProducerService.js';
import StorageService from './services/storage/StorageService.js';
import LikesService from './services/postgres/LikesService.js';
import CacheService from './services/redis/CacheService.js';

// Validators
import AlbumsValidator from './validator/albums/index.js';
import SongsValidator from './validator/songs/index.js';
import UsersValidator from './validator/users/index.js';
import AuthenticationsValidator from './validator/authentications/index.js';
import PlaylistsValidator from './validator/playlists/index.js';
import CollaborationsValidator from './validator/collaborations/index.js';
import ExportsValidator from './validator/exports/index.js'; // Pastikan import ini ada

// Utilities & Exceptions
import TokenManager from './tokenize/TokenManager.js';
import { ClientError } from './exceptions/index.js';

const init = async () => {
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(collaborationsService, songsService);
  const albumsService = new AlbumsService(songsService);
  const producerService = ProducerService;
  const storageService = new StorageService(path.resolve(__dirname, 'uploads/images'));
  const cacheService = new CacheService();
  const likesService = new LikesService(cacheService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        usersService,
        authenticationsService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
        storageService,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        songsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: exports,
      options: {
        producerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: likes,
      options: {
        service: likesService,
      },
    },
  ]);

  server.route({
    method: 'GET',
    path: '/albums/covers/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'uploads/images'),
      },
    },
  });

  // Perbaiki Global Error Handler
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response.isBoom) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }
    
    if (response instanceof Error) {
      console.error(response);
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();