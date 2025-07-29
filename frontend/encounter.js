// Star animation (encounter页面也需要星空背景)
function createStars() {
    const background = document.querySelector('.starry-background');
    const starsCount = 200;

    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        background.appendChild(star);
    }
}

// Add star styles dynamically
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .star {
        position: absolute;
        background-color: white;
        border-radius: 50%;
        opacity: 0;
        animation: starTwinkle 4s infinite;
    }

    @keyframes starTwinkle {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
    }
`;

document.head.appendChild(styleSheet);

// Initialize stars when page loads
window.addEventListener('load', createStars);

// 初始化对话功能
function initEncounterChat() {
    console.log('✅ initEncounterChat 已执行');
    const myMessageTextarea = document.querySelector('#myMessageForm textarea');
    const parallelMessageTextarea = document.querySelector('#parallelMessageForm textarea');
    const commonSendButton = document.getElementById('commonSendButton');
    if (!commonSendButton) {
        console.error('共用发送按钮不存在，请检查HTML元素ID是否为commonSendButton');
        return;
    }
    const charCountElements = document.querySelectorAll('.char-count');

    // 初始化两个表单的字数统计
    [myMessageTextarea, parallelMessageTextarea].forEach((textarea, index) => {
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCountElements[index].textContent = `${length}/200`;
            charCountElements[index].style.color = length > 200 ? '#ef4444' : 'rgba(255, 255, 255, 0.6)';
        });
    });

    // 绑定新按钮点击事件
    commonSendButton.addEventListener('click', sendCombinedMessage);

    // 回车发送支持
    [myMessageTextarea, parallelMessageTextarea].forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendCombinedMessage();
            }
        });
    });

    // 创建视频播放区域
    createVideoPlayerArea();

    // 合并发送函数
    function sendCombinedMessage() {
        const currentTrack = myMessageTextarea.value.trim();
        const unchosenTrack = parallelMessageTextarea.value.trim();

        // 表单验证
        if (!currentTrack || currentTrack.length > 200 || !unchosenTrack || unchosenTrack.length > 200) {
            alert('请确保两个输入框都填写内容且不超过200字');
            return;
        }

        const originalText = commonSendButton.textContent;
        commonSendButton.disabled = true;
        commonSendButton.textContent = '生成中...';

        // API调用逻辑
        fetch('http://localhost:8000/api/v1/generate/video', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                current_track: currentTrack,
                unchosen_track: unchosenTrack,
                user_name: 'wangwang'
            })
        }).then(response => response.json())
            .then(result => {
                if (result.code === 200 && result.data.success) {
                    const videoUrl = result.data.raw_llm_response.replace(/[`'\s]/g, '');
                    const videoPlayer = document.getElementById('videoPlayer');
                    const videoContainer = document.getElementById('videoPlayerContainer');
                    
                    // 修改为创建链接而非视频元素
                    videoContainer.innerHTML = `
                        <h3>平行宇宙视频已生成</h3>
                        <p>点击下方链接查看视频：</p>
                        <a href="${videoUrl}" target="_blank" class="video-status-link">
                            查看平行宇宙视频状态
                        </a>
                    `;
                    
                    videoContainer.classList.add('active');
                    videoContainer.scrollIntoView({ behavior: 'smooth' });
                } else {
                    throw new Error(result.msg || '生成失败');
                }
            })
            .catch(error => {
                console.error('API错误:', error);
                alert('生成视频失败: ' + error.message);
            })
            .finally(() => {
                commonSendButton.disabled = false;
                commonSendButton.textContent = originalText;
            });
    }
}

function createVideoPlayerArea() {
    // 避免重复创建
    if (document.getElementById('videoPlayerContainer')) return;
    
    const container = document.createElement('div');
    container.className = 'video-player-container';
    container.id = 'videoPlayerContainer';
    container.innerHTML = `
        <h3>平行宇宙视频</h3>
        <video id="videoPlayer" class="video-player" controls autoplay>
            您的浏览器不支持HTML5视频播放
        </video>
    `;
    document.querySelector('.universe-content').appendChild(container);
    return container;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initEncounterChat();
});