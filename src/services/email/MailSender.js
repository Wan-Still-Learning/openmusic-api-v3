// src/services/email/MailSender.js
import nodemailer from 'nodemailer';

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  sendEmail(targetEmail, content) {
    const playlistData = JSON.parse(content);
    const playlist = playlistData.playlist;
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ekspor Playlist OpenMusic</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 30px 20px;
          }
          .playlist-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 4px solid #667eea;
          }
          .playlist-title {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
          }
          .playlist-meta {
            color: #6c757d;
            font-size: 14px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }
          .songs-section {
            margin-top: 25px;
          }
          .songs-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e9ecef;
          }
          .song-item {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 12px;
            transition: transform 0.2s ease;
          }
          .song-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .song-title {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .song-performer {
            color: #667eea;
            font-size: 14px;
            font-weight: 500;
          }
          .no-songs {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .footer {
            background-color: #2c3e50;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 14px;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            background-color: #e8f4f8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .stat-item {
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          .stat-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 OpenMusic</h1>
            <p>Ekspor Playlist Berhasil</p>
          </div>
          
          <div class="content">
            <div class="playlist-info">
              <div class="playlist-title">${playlist.name}</div>
              <div class="playlist-meta">
                <span><strong>ID:</strong> ${playlist.id}</span>
                <span><strong>Dibuat:</strong> ${new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            <div class="stats">
              <div class="stat-item">
                <div class="stat-number">${playlist.songs ? playlist.songs.length : 0}</div>
                <div class="stat-label">Total Lagu</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">1</div>
                <div class="stat-label">Playlist</div>
              </div>
            </div>

            <div class="songs-section">
              <div class="songs-title">📀 Daftar Lagu</div>
              ${playlist.songs && playlist.songs.length > 0 
                ? playlist.songs.map((song, index) => `
                  <div class="song-item">
                    <div class="song-title">${index + 1}. ${song.title}</div>
                    <div class="song-performer">👤 ${song.performer}</div>
                  </div>
                `).join('')
                : '<div class="no-songs">Belum ada lagu dalam playlist ini</div>'
              }
            </div>
          </div>

          <div class="footer">
            <p>Terima kasih telah menggunakan <strong>OpenMusic</strong></p>
            <p>© ${new Date().getFullYear()} OpenMusic. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const message = {
      from: process.env.SMTP_USER,
      to: targetEmail,
      subject: '🎵 Ekspor Playlist OpenMusic - ' + playlist.name,
      text: `Ekspor Playlist: ${playlist.name}\n\nTotal Lagu: ${playlist.songs ? playlist.songs.length : 0}\n\nDaftar Lagu:\n${playlist.songs ? playlist.songs.map((song, index) => `${index + 1}. ${song.title} - ${song.performer}`).join('\n') : 'Belum ada lagu'}`,
      html: htmlTemplate,
    };
    return this._transporter.sendMail(message);
  }
}

export default MailSender;