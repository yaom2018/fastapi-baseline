# backend/services/generateCart.py
import re
import uuid
import logging
from cozepy import COZE_CN_BASE_URL, Coze, TokenAuth, Message, ChatStatus, MessageContentType  # noqa
import json
from config.config import settings
from utils.generation_models import GenerationRequest, GenerationResponseData, GenerationMode
import aiohttp  # 导入 aiohttp 用于异步 HTTP 请求


logger = logging.getLogger(__name__)

USER_PROMPT_WEB_DESIGNER = """"
<!-- 请在这里添加您的用户提示 -->
"""

async def generate_music(reqjson: GenerationRequest) -> GenerationResponseData:

    file_id = str(uuid.uuid4())

    coze_api_base = COZE_CN_BASE_URL
    # print(f'COZE_API_TOKEN: {settings.COZE_API_TOKEN}')
    # print(f'COZE_API_BASE_URL: {coze_api_base}')

    coze = Coze(auth=TokenAuth(token=settings.COZE_API_TOKEN), base_url=coze_api_base)

    workflow_id = '7532372345625952266'

    workflow = coze.workflows.runs.create(
        workflow_id=workflow_id,
        # 如果工作流需要输入参数，可以在这里添加
        parameters={"input": reqjson.prompt}
    )


    # Check if workflow.data is a string and attempt to parse it as JSON
    if isinstance(workflow.data, str):
        try:
            workflow_data = json.loads(workflow.data)
        except json.JSONDecodeError:
            logger.error("Failed to decode workflow.data as JSON")
            workflow_data = {}
    else:
        workflow_data = workflow.data

    music_url_arry = workflow_data.get('output', [])


    response_data = GenerationResponseData(
        file_id=file_id,
        success=True,
        raw_llm_response=music_url_arry[0] if music_url_arry else "",
        message="生成音乐URL成功"
    )

    return response_data

# 生成视频
async def generate_video(reqJson: GenerationRequest) -> GenerationResponseData:

    file_id = str(uuid.uuid4())

    coze_api_base = COZE_CN_BASE_URL

    coze = Coze(auth=TokenAuth(token=settings.COZE_API_TOKEN), base_url=coze_api_base)

    workflow_id = '7532298051194126399'

    workflow = coze.workflows.runs.create(
        workflow_id=workflow_id,
        # 如果工作流需要输入参数，可以在这里添加
        parameters={"current_track": reqJson.current_track,
                    "unchosen_track": reqJson.unchosen_track,
                    "user_name": reqJson.user_name}
    )

    # Check if workflow.data is a string and attempt to parse it as JSON
    if isinstance(workflow.data, str):
        try:
            workflow_data = json.loads(workflow.data)
        except json.JSONDecodeError:
            logger.error("Failed to decode workflow.data as JSON")
            workflow_data = {}
    else:
        workflow_data = workflow.data

    # Get the video URL from workflow_data
    video_url = workflow_data.get('output', "")

    response_data = GenerationResponseData(
        file_id=file_id,
        success=True,
        raw_llm_response=video_url if video_url else "",
        message="生成视频URL成功"
    )

    return response_data


# 生成视频
async def generate_chat(reqJson: GenerationRequest) -> GenerationResponseData:
    file_id = str(uuid.uuid4())
    coze_api_base = COZE_CN_BASE_URL
    api_url = f"{coze_api_base}/v1/workflows/chat"
    headers = {
        "Authorization": f"Bearer {settings.COZE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "workflow_id": "7532298026402381878",
        "parameters": {
            "CONVERSATION_NAME": "To_future_chat",
            "USER_INPUT": reqJson.prompt
        },
        "additional_messages": [
            {
                "content_type": "text",
                "role": "user",
                "type": "question"
            }
        ]
    }

    chat_response = ""
    async with aiohttp.ClientSession() as session:
        async with session.post(api_url, headers=headers, json=payload) as response:
            # 初始化一个列表用于存储 content 内容
            chat_response_list = []
            if response.status == 200:
                try:
                    # 逐行读取事件流数据
                    async for line in response.content:
                        line = line.decode('utf-8').strip()
                        if line.startswith('data:'):
                            data_str = line[len('data:'):].strip()
                            print(f'line: {line}')
                            print(f'data_str: {data_str}')
                            if data_str.lower() == '[done]':
                                break
                            try:
                                data = json.loads(data_str)
                                content = data.get('content')
                                # 检查 content 是否为字符串
                                if isinstance(content, str):
                                    chat_response_list.append(content)
                            except json.JSONDecodeError:
                                logger.error(f"Failed to decode event data: {data_str}")
                except Exception as e:
                    logger.error(f"Error reading event stream: {e}")
            else:
                logger.error(f"API request failed with status code {response.status}")
            # 从后向前遍历列表
            for item in reversed(chat_response_list):
                if not item.startswith('{') and re.search(r'[\u4e00-\u9fff]', item):
                    chat_response = item
                    break

    response_data = GenerationResponseData(
        file_id=file_id,
        success=True,
        raw_llm_response=chat_response if chat_response else "",
        message="生成聊天响应成功"
    )
    return response_data