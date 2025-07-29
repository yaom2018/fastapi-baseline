import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from app.router import get_main_router
from config.config import settings

# 创建FastAPI应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    debug=settings.DEBUG
)

# 配置允许的源列表
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",  # 常见的前端开发端口
    "http://localhost:5500",  # Live Server默认端口
    "http://127.0.0.1:5500"
    # 添加其他允许的源
]

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
    expose_headers=["*"],  # 暴露所有头部
    max_age=600,  # 预检请求缓存时间
)

os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
app_static_dir = os.path.join(os.path.dirname(__file__), settings.STATIC_DIR)
os.makedirs(app_static_dir, exist_ok=True)
app.mount(f"/{settings.STATIC_DIR}", StaticFiles(directory=app_static_dir), name=settings.STATIC_DIR)

# 挂载主路由
app.include_router(get_main_router())

# 添加中间件 用来验证jwt token
# app.middleware("http")(check_token)

# 启动应用
def run_server():
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )

if __name__ == "__main__":
    run_server()