#!/bin/bash

# 构建并启动Docker容器
echo "开始部署前端应用..."

docker-compose down
docker-compose up --build -d

echo "前端应用已成功部署！"
echo "可以通过 http://localhost:8080 访问应用"