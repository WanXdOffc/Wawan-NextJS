# Gunakan image Node.js versi ringan
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file konfigurasi package (npm)
COPY package.json package-lock.json* ./

# Install dependensi
RUN npm install

# Salin seluruh kode proyek ke dalam container
COPY . .

# Build aplikasi Next.js untuk production
RUN npm run build

# Buka port 3000
EXPOSE 3000

# Jalankan aplikasi Next.js
CMD ["npm", "start"]
