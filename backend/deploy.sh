#!/bin/bash

# 项目名称，用于容器和镜像命名
PROJECT_NAME="fastapi-backend"

# 镜像标签
IMAGE_TAG="latest"

# 构建 Docker 镜像
echo "正在构建 Docker 镜像..."
COMPOSE_HTTP_TIMEOUT=300 DOCKER_BUILDKIT=0 docker-compose build

if [ $? -ne 0 ]; then
  echo "镜像构建失败，部署终止。"
  exit 1
fi

# 继续其他部署步骤...
docker build -t "${PROJECT_NAME}:${IMAGE_TAG}" .

# 检查镜像是否构建成功
if [ $? -ne 0 ]; then
    echo "镜像构建失败，部署终止。"
    exit 1
fi

# 停止并移除旧容器
echo "正在停止并移除旧容器..."
docker stop "${PROJECT_NAME}" 2>/dev/null
docker rm "${PROJECT_NAME}" 2>/dev/null

# 创建并启动新容器
echo "正在启动新容器..."
docker run -d -p 8000:8000 --name "${PROJECT_NAME}" "${PROJECT_NAME}:${IMAGE_TAG}"

# 检查容器是否启动成功
if [ $? -eq 0 ]; then
    echo "容器启动成功，部署完成。"
else
    echo "容器启动失败，部署终止。"
    exit 1
fi
