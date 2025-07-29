# backend/services/generateCart.py
import uuid
import logging
from cozepy import COZE_CN_BASE_URL, Coze, TokenAuth, Message, ChatStatus, MessageContentType  # noqa
import json
from config.config import settings
from utils.generation_models import GenerationRequest, GenerationResponseData, GenerationMode


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