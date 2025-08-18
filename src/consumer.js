// src/consumer.js
import 'dotenv/config';
import amqp from 'amqplib';
import MailSender from './services/email/MailSender.js';
import PlaylistsService from './services/postgres/PlaylistsService.js';
import SongsService from './services/postgres/SongsService.js';

const init = async () => {
  const mailSender = new MailSender();
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(null, songsService); // playlistsService membutuhkan songsService

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  console.log('Consumer berhasil terhubung ke RabbitMQ');

  const queue = 'export:playlists';
  await channel.assertQueue(queue, {
    durable: true,
  });

  channel.consume(queue, async (message) => {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      
      // Mengambil data playlist lengkap dari database
      const playlist = await playlistsService.getPlaylistById(playlistId);
      playlist.songs = await playlistsService.getPlaylistSongs(playlistId);
      
      const result = await mailSender.sendEmail(targetEmail, JSON.stringify({ playlist }));
      
      console.log(result);
      channel.ack(message);
    } catch (error) {
      console.error(error);
      channel.nack(message);
    }
  });
};

init();