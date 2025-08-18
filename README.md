# OpenMusic API v3

Aplikasi OpenMusic API v3 adalah layanan RESTful untuk mengelola data album, lagu, pengguna, dan playlist dengan sistem autentikasi, kolaborasi, upload cover album, sistem like, caching, dan message queue. API ini dikembangkan sebagai bagian dari proyek OpenMusic, yang bertujuan untuk menyediakan musik berlisensi gratis dengan fitur manajemen playlist yang aman dan performa yang optimal.

## ✨ Fitur Baru di v3

### 📸 Upload Cover Album
* **File Upload:** Upload gambar cover album menggunakan multipart/form-data
* **Validasi File:** Validasi tipe file hanya menerima format gambar
* **Size Limit:** Pembatasan ukuran file untuk mencegah upload file terlalu besar
* **Static Serving:** Akses cover album melalui endpoint statis

### ❤️ Sistem Like Album
* **Like/Unlike:** Pengguna dapat menyukai atau membatalkan suka pada album
* **Like Counter:** Menghitung jumlah total like pada setiap album
* **User Tracking:** Mencegah duplikasi like dari pengguna yang sama

### ⚡ Caching dengan Memurai
* **Performance Optimization:** Caching data like album untuk akses yang lebih cepat
* **Cache Management:** Otomatis invalidasi cache saat data berubah
* **Cache Header:** Response header X-Data-Source untuk menandai data dari cache

### 📨 Message Queue dengan RabbitMQ
* **Export Playlist:** Export data playlist ke format JSON
* **Asynchronous Processing:** Background processing menggunakan message queue
* **Email Notification:** Pengiriman email dengan hasil export playlist

## Fitur dari Versi Sebelumnya

### 🔐 Sistem Autentikasi (v2)
* **Registrasi Pengguna:** Pendaftaran akun dengan username dan password yang di-hash menggunakan bcrypt
* **Login/Logout:** Sistem autentikasi menggunakan JWT (Access Token & Refresh Token)
* **Token Management:** Refresh token untuk memperpanjang sesi pengguna secara aman

### 📝 Manajemen Playlist (v2)
* **CRUD Playlist:** Menambah, melihat, mengubah, dan menghapus playlist pribadi
* **Playlist Songs:** Menambah dan menghapus lagu dari playlist
* **Access Control:** Hanya pemilik playlist yang dapat memodifikasi

### 🤝 Sistem Kolaborasi (v2)
* **Kolaborator Playlist:** Pemilik dapat menambahkan pengguna lain sebagai kolaborator
* **Shared Access:** Kolaborator dapat menambah/menghapus lagu dari playlist
* **Permission Management:** Kontrol akses yang ketat untuk setiap operasi

### 📊 Activity Tracking (v2)
* **Playlist Activities:** Pencatatan semua aktivitas add/delete lagu dalam playlist
* **Activity History:** Melihat riwayat aktivitas dengan informasi pengguna, lagu, dan waktu

## Fitur Utama

* **Pengelolaan Album:** CRUD album dengan upload cover dan sistem like
* **Pengelolaan Lagu:** CRUD lagu dengan filter pencarian
* **Manajemen Pengguna:** Registrasi, login, dan manajemen autentikasi dengan JWT
* **Sistem Playlist:** CRUD playlist dengan kontrol akses dan export functionality
* **Kolaborasi:** Fitur berbagi playlist dengan pengguna lain
* **Activity Logging:** Pelacakan aktivitas dalam playlist
* **File Upload:** Upload dan serving file cover album
* **Like System:** Sistem like/unlike album dengan caching
* **Export Feature:** Export playlist dengan email notification
* **Validasi Data:** Penerapan validasi payload untuk setiap request
* **Penanganan Error:** Respons error yang konsisten (400, 401, 403, 404, 413, 500)
* **Persistensi Data:** PostgreSQL dengan relasi yang kompleks
* **Database Migrations:** Pengelolaan skema database menggunakan `node-pg-migrate`
* **Performance:** Memurai caching dan RabbitMQ message queue

## Persyaratan Sistem

Pastikan Anda memiliki hal-hal berikut terinstal di sistem Anda:

* **Node.js**: Versi LTS terbaru (v18 atau yang lebih baru direkomendasikan)
* **npm**: Node Package Manager (biasanya terinstal bersama Node.js)
* **PostgreSQL**: Database server yang berjalan
* **Memurai**: Redis-compatible caching service
* **RabbitMQ**: Message broker untuk background processing

    **Instalasi Services:**
    
    **PostgreSQL:**
    - Download dan install dari [postgresql.org](https://www.postgresql.org/download/windows/)
    - Jalankan service PostgreSQL di port 5432 (default)
    - Buat database `openmusic` menggunakan pgAdmin atau command line
    
    **Memurai (untuk Windows):**
    - Download dari [memurai.com](https://www.memurai.com/get-memurai)
    - Install dan jalankan di port 6379 (default)
    - Pastikan service Memurai berjalan sebelum start aplikasi
    
    **RabbitMQ:**
    - Download dari [rabbitmq.com](https://www.rabbitmq.com/download.html)
    - Install dan enable RabbitMQ Management Plugin
    - Akses management console di `http://localhost:15672` (guest/guest)

## Tahap Instalasi dan Setup

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan OpenMusic API v3:

1.  **Clone Repositori:**
    ```bash
    git clone <repository-url>
    cd open-music-api-v3
    ```

2.  **Instal Dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables:**
    Buat file `.env` di root proyek dengan konfigurasi berikut:

    ```dotenv
    # .env
    HOST=localhost
    PORT=5000

    # Database Configuration
    PGUSER=postgres
    PGPASSWORD=your_strong_password
    PGDATABASE=openmusic
    PGHOST=localhost
    PGPORT=5432

    # JWT Configuration
    ACCESS_TOKEN_KEY=your_access_token_secret_key
    REFRESH_TOKEN_KEY=your_refresh_token_secret_key
    ACCESS_TOKEN_AGE=1800

    # Memurai Configuration (Redis-compatible)
    REDIS_SERVER=redis://localhost:6379

    # RabbitMQ Configuration
    RABBITMQ_SERVER=amqp://localhost

    # Email Configuration (untuk export feature)
    MAIL_HOST=smtp.gmail.com
    MAIL_PORT=465
    MAIL_USERNAME=your_email@gmail.com
    MAIL_PASSWORD=your_app_password
    ```

4.  **Buat Database PostgreSQL:**
    ```bash
    node create-db.js
    ```

5.  **Jalankan Migrasi Database:**
    ```bash
    npm run migrate up
    ```

6.  **Jalankan Aplikasi:**
    ```bash
    npm run start
    ```
    Server akan berjalan di `http://localhost:5000`

7.  **Jalankan Consumer (untuk export feature):**
    ```bash
    npm run start-consumer
    ```

## API Documentation

### Albums Endpoints

* **POST /albums** - Menambahkan album baru
* **GET /albums** - Mendapatkan semua album  
* **GET /albums/{id}** - Mendapatkan detail album dengan lagu
* **PUT /albums/{id}** - Mengubah data album
* **DELETE /albums/{id}** - Menghapus album
* **POST /albums/{id}/covers** - Upload cover album (multipart/form-data)
* **GET /albums/covers/{filename}** - Akses file cover album

### Songs Endpoints

* **POST /songs** - Menambahkan lagu baru
* **GET /songs** - Mendapatkan semua lagu (dengan filter optional)
* **GET /songs/{id}** - Mendapatkan detail lagu
* **PUT /songs/{id}** - Mengubah data lagu
* **DELETE /songs/{id}** - Menghapus lagu

### Users & Authentication

* **POST /users** - Registrasi pengguna baru
* **POST /authentications** - Login pengguna
* **PUT /authentications** - Refresh access token
* **DELETE /authentications** - Logout pengguna

### Playlists (Perlu autentikasi)

* **POST /playlists** - Membuat playlist baru
* **GET /playlists** - Mendapatkan playlist pengguna
* **DELETE /playlists/{id}** - Menghapus playlist
* **POST /playlists/{id}/songs** - Menambah lagu ke playlist
* **GET /playlists/{id}/songs** - Mendapatkan lagu dalam playlist
* **DELETE /playlists/{id}/songs** - Menghapus lagu dari playlist
* **GET /playlists/{id}/activities** - Mendapatkan aktivitas playlist

### Collaborations (Perlu autentikasi)

* **POST /collaborations** - Menambah kolaborator
* **DELETE /collaborations** - Menghapus kolaborator

### 🆕 Likes (Perlu autentikasi)

* **POST /albums/{id}/likes** - Like album
* **DELETE /albums/{id}/likes** - Unlike album
* **GET /albums/{id}/likes** - Mendapatkan jumlah like album

### 🆕 Exports (Perlu autentikasi)

* **POST /export/playlists/{playlistId}** - Export playlist ke email
    * Body: `{"targetEmail": "user@example.com"}`

## 🔒 Sistem Keamanan

* **Password Hashing:** bcrypt dengan salt rounds 10
* **JWT Authentication:** Access token dengan masa berlaku 30 menit
* **Refresh Token:** Token di database untuk memperpanjang sesi
* **Authorization:** Kontrol akses berdasarkan kepemilikan dan kolaborasi
* **File Upload Security:** Validasi tipe file dan ukuran maksimal
* **Input Validation:** Validasi ketat menggunakan Joi schema

## 🗄️ Database Schema

Database terdiri dari 9 tabel utama:
* `albums` - Data album musik (dengan cover_url)
* `songs` - Data lagu dengan relasi ke albums
* `users` - Data pengguna dengan password yang di-hash
* `authentications` - Refresh tokens untuk autentikasi
* `playlists` - Data playlist dengan owner
* `playlist_songs` - Relasi many-to-many antara playlist dan songs
* `collaborations` - Relasi kolaborator dengan playlist
* `playlist_song_activities` - Log aktivitas dalam playlist
* `user_album_likes` - Data like pengguna terhadap album

## 🚀 Performance & Scalability

* **Memurai Caching:** Caching data like album untuk performa optimal
* **Message Queue:** Background processing dengan RabbitMQ
* **File Storage:** Efficient file serving untuk cover album
* **Database Indexing:** Optimasi query dengan proper indexing
* **Error Handling:** Comprehensive error handling dan logging

## 🧪 Testing

Proyek ini telah lulus semua test case dengan komprehensif coverage:
* **Unit Tests:** Testing untuk setiap service dan handler
* **Integration Tests:** Testing endpoint-to-endpoint
* **File Upload Tests:** Validasi upload dan serving file
* **Performance Tests:** Testing caching dan message queue

### 📁 File Testing Postman

Collection dan environment Postman untuk testing API tersedia di:
```
C:\Users\Ikhwanul Abiyu\Postman\files
```

**Cara menggunakan:**
1. Buka Postman
2. Import collection dan environment dari direktori tersebut
3. Set environment variables sesuai dengan konfigurasi server Anda
4. Jalankan test collection untuk validasi semua endpoint

## 📁 Struktur Proyek

```
src/
├── api/           # API handlers dan routes
├── services/      # Business logic services
├── validator/     # Request validation schemas
├── exceptions/    # Custom error classes
├── tokenize/      # JWT token management
├── uploads/       # File storage directory
└── server.js      # Main server configuration
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate up

# Start development server
npm run start

# Start consumer
npm run start-consumer
```

## 📝 License

MIT License - Lihat file LICENSE untuk detail lebih lanjut.