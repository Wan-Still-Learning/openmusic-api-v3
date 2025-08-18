import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class LikesHandler {
    constructor(service) {
        this._service = service;
    }

    async postAlbumLikeHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._service.addAlbumLike(userId, albumId);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil disukai',
        });
        response.code(201);
        return response;
    }

    async deleteAlbumLikeHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._service.deleteAlbumLike(userId, albumId);

        return {
            status: 'success',
            message: 'Batal menyukai album berhasil',
        };
    }

    async getAlbumLikesHandler(request, h) {
        const { id: albumId } = request.params;
        const { likes, isCache } = await this._service.getAlbumLikes(albumId);
    
        const response = h.response({
          status: 'success',
          data: {
            likes,
          },
        });
    
        if (isCache) {
          response.header('X-Data-Source', 'cache');
        }
    
        return response;
    }
    
}

export default LikesHandler;