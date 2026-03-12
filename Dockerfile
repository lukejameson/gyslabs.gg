FROM nginx:alpine
RUN apk add --no-cache gettext
COPY index.html /tmp/index.html
COPY images/ /usr/share/nginx/html/images/
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
