FROM nginx:alpine
COPY index.html /tmp/index.html
COPY images/ /usr/share/nginx/html/images/
RUN envsubst < /tmp/index.html > /usr/share/nginx/html/index.html
EXPOSE 80
