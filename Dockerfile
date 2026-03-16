FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build-blog

FROM nginx:alpine
RUN apk add --no-cache gettext
COPY --from=builder /app/index.html /tmp/index.html
COPY --from=builder /app/blog/index.html /usr/share/nginx/html/blog/index.html
COPY --from=builder /app/blog/posts /usr/share/nginx/html/blog/posts
COPY --from=builder /app/blog/images /usr/share/nginx/html/blog/images
COPY images/ /usr/share/nginx/html/images/
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
