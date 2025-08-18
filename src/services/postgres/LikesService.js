import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(userId, albumId) {
    // Check if album exists
    const albumQuery = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (albumResult.rows.length === 0) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      throw new InvariantError('Pengguna sudah menyukai album ini.');
    }

    const id = `like-${nanoid(16)}`;
    const insertQuery = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    await this._pool.query(insertQuery);

    // Hapus cache setelah ada perubahan
    await this._cacheService.del(`album_likes:${albumId}`);
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Suka pada album tidak ditemukan');
    }

    // Hapus cache setelah ada perubahan
    await this._cacheService.del(`album_likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    // Check if album exists
    const albumQuery = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (albumResult.rows.length === 0) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    try {
      // Coba ambil dari cache
      const result = await this._cacheService.get(`album_likes:${albumId}`);
      return { likes: JSON.parse(result), isCache: true };
    } catch (error) {
      // Jika cache tidak ditemukan, ambil dari database
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].count, 10);

      // Simpan ke cache sebelum dikembalikan
      await this._cacheService.set(`album_likes:${albumId}`, JSON.stringify(likes));
      return { likes, isCache: false };
    }
  }
}

export default LikesService;