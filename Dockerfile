# AirSense City - Production Container Image
FROM node:22-alpine

WORKDIR /app

# Salin manifest dependensi
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Salin aset dan source code
COPY . .

# Ekspos port HTTP
EXPOSE 3000

# Jalankan server AirSense City
CMD ["node", "server.js"]

