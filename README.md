# Wanyzx

Project portfolio personal yang dibuat pakai Next.js. Isinya lengkap, dari blog, showcase project, sampai tools-tools keren yang bisa dipake sama orang lain.

## Deskripsi Project

Ini website portfolio yang nggak cuma buat pamer karya, tapi juga punya banyak fitur interaktif. Tujuannya:

* Nampilin portfolio project dengan cara yang keren
* Berbagi kode lewat code library
* Kasih tools gratis buat orang lain (parser web, tempmail, upload file, dll)
* Blog untuk nulis artikel
* Admin dashboard buat manage semua konten
* AI chatbot pakai scraper (nggak perlu API key berbayar)
* Music player buat dengerin lagu sambil browsing

Yang unik dari project ini: **semua fitur AI pakai scraper**, jadi nggak perlu bayar API key. File upload juga simpan lokal di folder `public/uploads`, nggak pakai cloud storage yang ribet.

## Fitur Utama

### 1. Portfolio & Blog
* **Projects Showcase**: Nampilin project-project yang pernah dibuat dengan gambar, tech stack, dan link demo
* **Blog System**: Nulis artikel pakai markdown, ada kategori dan tags
* **Skills Display**: Tampilin skill dengan progress bar yang keren
* **About Page**: Halaman perkenalan diri

### 2. AI Features (Scraper-Based)
* **Wanyzx AI Chatbot**: Chat sama AI pakai berbagai model (GPT, Claude, Gemini) via scraper
* **AI Image Generator**: Bikin gambar dari text prompt via scraper
* **Smart Search**: Cari konten dengan hasil yang lebih akurat

**Available AI Scrapers:**
- `ai-unified.ts` - Unified interface untuk berbagai AI
- `gpt3.ts` - GPT scraper
- `gemini.ts` & `gemmy.ts` - Google Gemini scraper
- `brat.ts` - Custom AI scraper
- `cuaca.ts` - Weather & general AI scraper

### 3. Music Player
* Playlist management
* Play, pause, shuffle, repeat
* Background playback (tetep jalan waktu ganti halaman)
* Queue system
* Data musik disimpan di MongoDB

### 4. Code Library
* Kumpulan code snippet yang bisa dicopy langsung
* Syntax highlighting
* Filter berdasarkan bahasa pemrograman
* Rating system
* Semua data di MongoDB, nggak pakai library eksternal

### 5. Tools Collection
* **Web Parser**: Extract data dari website (meta tags, images, links)
* **TempMail**: Bikin email sementara buat testing
* **File Uploader**: Upload dan share file (simpan di `/public/uploads`)
* **Download Hub**: Tempat download resources gratis
* **QR Code Generator**: Bikin QR code
* **Novel Scraper**: Scrape novel dari sakuranovel

### 6. Scrapers
Project ini punya banyak scraper custom:
* **Instagram Stalking** (`igStalk.ts`)
* **GitHub Stalking** (`githubStalk.ts`)
* **GitHub Downloader** (`githubDownloader.ts`)
* **Spotify Scraper** (`spotify.ts`) - Nggak pakai API official
* **Anime Scraper** (`an1.ts`)
* **Waifu Images** (`waifu.ts`)
* **Resi Tracking** (`resi.ts`)
* **Weather** (`cuaca.ts`)

### 7. Shop
* Jual digital products atau physical products
* Shopping cart
* Order management
* Data tersimpan di MongoDB

### 8. Admin Dashboard
Manage semua konten dari satu tempat:
* Blog posts (create, edit, delete)
* Projects
* Code library
* Music library
* Products
* Skills
* File management
* Analytics & statistics
* User management
* Leaderboard
* Notifications
* Feature requests

### 9. Lain-lain
* **Donation Page**: Buat nerima donasi
* **Feature Request**: User bisa request fitur baru
* **Leaderboard**: Top contributors atau active users
* **Novel Reader**: Baca novel online (scraping dari sumber tertentu)
* **Anime Search**: Cari info anime
* **Analytics Tracking**: Track visitor & page views

## Tech Stack

**Frontend:**
* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* Framer Motion (animasi)

**Backend:**
* Next.js API Routes
* MongoDB (database)
* Mongoose (ODM)

**AI & Scrapers:**
* Custom scraper implementations (nggak pakai API key berbayar)
* Berbagai AI model via scraping
* Web scraping untuk berbagai services

**File Storage:**
* Local storage di `/public/uploads`
* Nggak pakai Cloudinary atau AWS S3

## Cara Install & Jalankan

### 1. Clone Repository

```bash
git clone https://github.com/WanXdOffc/Wawan-NextJS.git
cd wawan-NextJS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root folder:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/wawan-portfolio

# Auth
PASSWORD_ADMIN=password-rahasia-minimal-32-karakter
```

**Cara generate password:**
```bash
openssl rand -base64 32
```

Atau buat string random sendiri yang panjang.

**Catatan:** Nggak perlu API key AI, Spotify, Cloudinary, atau services lain karena semua pakai scraper dan local storage.

### 4. Setup Folder Upload

Pastikan folder upload ada dan bisa diakses:

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka browser di `http://localhost:3000`

### 6. Build untuk Production

```bash
npm run build
npm start
```

## Struktur Folder

```
/public
  /uploads            # File yang diupload user (local storage)
  /icons              # Icon & SVG files

/src
  /app                # Next.js App Router
    /api              # API endpoints
      /admin          # Admin API
        /analytics
        /blogs
        /files
        /leaderboard
        /library
        /music
        /notifications
        /products
        /projects
        /requests
        /services
        /skills
        /stats
        /tempmail
        /wanyzx-ai
      /ai             # AI scraper endpoint
      /analytics-track
      /anime          # Anime scraper
      /blogs          # Blog API
      /donation
      /files
      /identitas
      /library
      /music
      /novel          # Novel scraper
      /products
      /projects
      /requests
      /search
      /services
      /settings
      /skills
      /spotify        # Spotify scraper
      /tools          # Tools API
        /ai-image
        /parser
        /tempmail
        /upload
      /upload
    /admin            # Admin dashboard
    /blog             # Blog pages
    /projects         # Project pages
    /tools            # Tools pages
    
  /components
    /ui               # UI components
    
  /lib
    /models           # Mongoose models
    /scrapers         # AI & web scrapers
      ai-unified.ts
      an1.ts          # Anime
      brat.ts
      cuaca.ts        # Weather
      gemini.ts
      gemmy.ts
      githubDownloader.ts
      githubStalk.ts
      gpt3.ts
      igStalk.ts      # Instagram
      qrcode.ts
      resi.ts         # Package tracking
      spotify.ts
      waifu.ts
    apiResponse.ts
    logActivity.ts
    mongodb.ts
    rateLimit.ts
    sakuranovel.ts
    trackAnalytics.ts
    uploader.ts
    utils.ts
```

## MongoDB Setup

**Lokal:**
```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu/Debian
sudo apt install mongodb

# Jalankan
mongod
```

**Cloud (MongoDB Atlas) - GRATIS:**
1. Daftar di [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Bikin cluster gratis (512MB storage)
3. Whitelist IP: `0.0.0.0/0` (untuk development)
4. Dapatkan connection string
5. Paste ke `MONGODB_URI` di `.env.local`

Contoh connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wawan-portfolio?retryWrites=true&w=majority
```

## Deploy

### Vercel (Paling Gampang)

1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahin environment variables:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
4. Deploy

**Catatan untuk Vercel:**
- File upload akan tersimpan temporary (Vercel filesystem read-only)
- Kalau mau file upload persistent, perlu pakai external storage atau self-host

Atau pakai Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```

### VPS / Server Sendiri (Recommended untuk File Upload)

```bash
# Install dependencies
npm install

# Build
npm run build

# Jalankan dengan PM2
npm install -g pm2
pm2 start npm --name "wawan-portfolio" -- start
pm2 save
pm2 startup
```

Setup Nginx untuk reverse proxy ke port 3000:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker

```bash
# Build
docker build -t wawan-portfolio .

# Run
docker run -p 3000:3000 --env-file .env.local wawan-portfolio
```

## Admin Dashboard

Akses admin di `/admin` setelah login.

Default admin credentials perlu di-setup di database atau lewat environment variables.

## Catatan Penting

* **Scraper-based**: Semua AI features pakai scraper, nggak perlu API key berbayar
* **Local storage**: File upload tersimpan di `/public/uploads`, bukan cloud
* **MongoDB required**: Database wajib ada untuk semua fitur
* **Rate limiting**: Ada rate limit untuk prevent abuse
* **Analytics**: Built-in analytics tracking
* **No external dependencies**: Nggak perlu Cloudinary, AWS S3, OpenAI API, Spotify API, dll

## Kelebihan & Kekurangan

**Kelebihan:**
* ✅ Gratis - nggak perlu bayar API key
* ✅ Full control - semua data di server sendiri
* ✅ Privacy - nggak ada data yang keluar ke third-party
* ✅ Customizable - bisa modif scraper sesuai kebutuhan

**Kekurangan:**
* ❌ Scraper bisa break kalau sumber berubah
* ❌ Rate limit dari sumber scraping
* ❌ Response time bisa lebih lambat dari API official
* ❌ File upload di Vercel nggak persistent (butuh VPS)

## Troubleshooting

**MongoDB connection error:**
```bash
# Pastikan MongoDB running
mongod

# Check connection string di .env.local
# Pastikan username, password, dan database name benar
```

**File upload error:**
```bash
# Pastikan folder uploads ada dan writable
mkdir -p public/uploads
chmod 755 public/uploads
```

**Scraper error:**
```bash
# Scraper mungkin break karena source berubah
# Check log error dan update scraper code sesuai kebutuhan
```

## Kontribusi

Kalau mau contribute:
1. Fork repo ini
2. Bikin branch baru (`git checkout -b feature/fitur-baru`)
3. Commit changes (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Bikin Pull Request

Contribution yang dibutuhkan:
* Update scraper yang break
* Tambahin scraper baru
* Fix bugs
* Improve UI/UX
* Tambahin fitur baru

## Lisensi

MIT License - Bebas dipakai, dimodifikasi, dan didistribusikan.

## Kontak

* Website: [yourwebsite.com](https://yourwebsite.com)
* Email: contact@yourwebsite.com
* GitHub: [@yourusername](https://github.com/yourusername)

---

**Dibuat dengan ☕ dan 💻 oleh Wawan**

*Project ini dibuat untuk belajar dan eksperimen. Gunakan dengan bijak.*
