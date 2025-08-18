class AlbumsHandler {
  constructor(service, validator, storageService) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;
    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler(request, h) {
    try {
      const { id } = request.params;
      const { cover } = request.payload;

      // Validate that cover file exists and has hapi metadata
      if (!cover || !cover.hapi) {
        const response = h.response({
          status: 'fail',
          message: 'Cover harus berupa file',
        });
        response.code(400);
        return response;
      }

      // Validate that the file is an image
      const contentType = cover.hapi.headers['content-type'] || cover.hapi.contentType;
      
      if (!contentType || !contentType.startsWith('image/')) {
        const response = h.response({
          status: 'fail',
          message: 'Cover harus berupa file gambar',
        });
        response.code(400);
        return response;
      }

      // Ensure storage service exists
      if (!this._storageService || typeof this._storageService.writeFile !== 'function') {
        throw new Error('Storage service not properly initialized');
      }

      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;

      await this._service.addAlbumCover(id, coverUrl);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch (error) {
      // Handle payload too large error
      if (error.output && error.output.statusCode === 413) {
        const response = h.response({
          status: 'fail',
          message: 'File terlalu besar',
        });
        response.code(413);
        return response;
      }
      
      // Log the error for debugging
      console.error('Album cover upload error:', error);
      
      // Handle specific validation errors
      if (error.message && error.message.includes('Cover harus')) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(400);
        return response;
      }
      
      throw error;
    }
  }
}

export default AlbumsHandler;