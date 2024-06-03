FROM node:20.12.1 as frontend
WORKDIR /app
COPY package-lock.json package.json /app/
COPY src /app/src
COPY public /app/public
RUN npm install
RUN npm run build

FROM python:3.10.13
WORKDIR /app
RUN pip install flask==3.0.3 requests==2.31.0
COPY --from=frontend /app/build /app/build
COPY backend.py ./backend.py