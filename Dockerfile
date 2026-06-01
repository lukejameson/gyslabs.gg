FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production=false
COPY . .
ARG CACHEBUST=unknown
RUN echo "Building at ${CACHEBUST}" && npm run build-blog

# Build Tailwind CSS
FROM node:20-alpine AS tailwind-builder
WORKDIR /app
COPY --from=builder /app/index.html ./
COPY --from=builder /app/blog/index.html ./blog/
COPY --from=builder /app/blog/posts ./blog/posts/
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/src/tailwind-input.css ./src/
RUN npx tailwindcss@3 -c tailwind.config.js -i src/tailwind-input.css -o dist/tailwind.css --minify

FROM nginx:alpine
RUN apk add --no-cache gettext
COPY --from=builder /app/index.html /tmp/index.html
COPY --from=builder /app/blog/index.html /usr/share/nginx/html/blog/index.html
COPY --from=builder /app/blog/posts /usr/share/nginx/html/blog/posts
COPY --from=builder /app/blog/images /usr/share/nginx/html/blog/images
COPY --from=builder /app/blog/posts.json /usr/share/nginx/html/blog/posts.json
COPY --from=tailwind-builder /app/dist/tailwind.css /usr/share/nginx/html/tailwind.css
COPY images/ /usr/share/nginx/html/images/
RUN find /usr/share/nginx/html/blog/posts -name "index.html" -type f
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
