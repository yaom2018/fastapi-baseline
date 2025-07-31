# 使用 Python 基础镜像
FROM python:3.10

# 设置工作目录
WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*
# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN #pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
# 复制项目文件
COPY . .

# 暴露 FastAPI 默认端口
EXPOSE 8000

# 启动 FastAPI 应用
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
