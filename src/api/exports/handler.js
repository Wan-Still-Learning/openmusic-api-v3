// src/api/exports/handler.js
class ExportsHandler {
    constructor(producerService, playlistsService, validator) {
      this._producerService = producerService;
      this._playlistsService = playlistsService;
      this._validator = validator;
    }
  
    async postExportPlaylistHandler(request, h) {
      this._validator.validateExportPlaylistPayload(request.payload);
      const { playlistId } = request.params;
      const { targetEmail } = request.payload;
      const { id: credentialId } = request.auth.credentials;
  
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
  
      const message = JSON.stringify({ playlistId, targetEmail });
      await this._producerService.sendMessage('export:playlists', message);
  
      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;
    }
  }
  
  export default ExportsHandler;