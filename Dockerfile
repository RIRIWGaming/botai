FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  ffmpeg \
  git \
  curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /usr/src/app/session

EXPOSE 3000

CMD ["node", "index.js"]
