FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY GYSLabs.png /usr/share/nginx/html/GYSLabs.png

EXPOSE 80
