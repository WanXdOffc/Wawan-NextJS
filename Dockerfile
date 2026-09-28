FROM node:20-alpine

WORKDIR /app

# Salin file konfigurasi dependensi
COPY package.json package-lock.json* bun.lock* ./

# Install dependensi dengan bypass konflik peer-deps
RUN npm install --legacy-peer-deps --force

# Salin seluruh kode proyek
COPY . .

# Matikan telemetry Next.js saat build
ENV NEXT_TELEMETRY_DISABLED=1

# Build aplikasi Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
