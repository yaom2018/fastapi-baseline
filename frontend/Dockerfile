# 使用官方Nginx镜像作为基础镜像
FROM nginx:alpine

# 将项目文件复制到Nginx的默认网站目录
COPY . /usr/share/nginx/html

# 如果有自定义的nginx配置，可以复制到容器中
# COPY nginx.conf /etc/nginx/nginx.conf

# 暴露80端口
EXPOSE 8080

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]