import LikesHandler from './handler.js';
import routes from './routes.js';

const likes = {
    name: 'likes',
    version: '1.0.0',
    register: async (server, { service }) => {
        const likesHandler = new LikesHandler(service);
        server.route(routes(likesHandler));
    },
};

export default likes;