FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production=false
COPY . .
ARG CACHEBUST=unknown
RUN echo "Building at ${CACHEBUST}" && npm run build-blog
FROM nginx:alpine
RUN apk add --no-cache gettext
COPY --from=builder /app/index.html /tmp/index.html
COPY --from=builder /app/blog/index.html /usr/share/nginx/html/blog/index.html
COPY --from=builder /app/blog/posts /usr/share/nginx/html/blog/posts
COPY --from=builder /app/blog/images /usr/share/nginx/html/blog/images
COPY --from=builder /app/blog/posts.json /usr/share/nginx/html/blog/posts.json
COPY images/ /usr/share/nginx/html/images/
RUN find /usr/share/nginx/html/blog/posts -name "index.html" -type f
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
