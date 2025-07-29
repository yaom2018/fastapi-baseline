// Star animation
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

// 修改音乐播放器点击事件
// 将事件监听器绑定到明确的播放按钮
const playButton = document.getElementById('playButton');
let isPlaying = false;
let audioElement = null;

playButton.addEventListener('click', async () => {
    if (!audioElement) {
        audioElement = createAudioElement();
    }

    const progressBar = document.querySelector('.progress');
    const timeDisplay = document.querySelector('.time');
    const musicPlayer = document.querySelector('.music-player');

    if (!isPlaying) {
        // 获取音乐URL并播放
        const musicUrl = await fetchMusicUrl('宝宝肚肚打雷了');
        if (musicUrl) {
            audioElement.src = musicUrl;
            try {
                await audioElement.play();
                isPlaying = true;
                playButton.textContent = '❚❚'; // 更改按钮为暂停图标
                playButton.classList.add('playing');

                // 监听时间更新事件
                audioElement.addEventListener('timeupdate', () => {
                    updateProgressDisplay(audioElement, progressBar, timeDisplay);
                });

                // 音乐结束时重置状态
                audioElement.addEventListener('ended', () => {
                    isPlaying = false;
                    playButton.textContent = '▶';
                    playButton.classList.remove('playing');
                    progressBar.style.width = '0%';
                    timeDisplay.textContent = '0:00 / 0:00';
                });
            } catch (error) {
                console.error('播放失败:', error);
                alert('无法播放音乐: ' + error.message);
            }
        }
    } else {
        // 暂停音乐
        audioElement.pause();
        isPlaying = false;
        playButton.textContent = '▶'; // 更改按钮为播放图标
        playButton.classList.remove('playing');
    }
});

// Button hover effects
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
});

async function fetchMusicUrl(prompt) {
    try {
        console.log('请求音乐API:', prompt);
        // 1. 添加请求取消控制器，防止内存泄漏
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        // 这里需要替换为实际的API端点
        const apiUrl = 'http://127.0.0.1:8000/api/v1/generate/music';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',              
            },
            body: JSON.stringify({ prompt: prompt }),
            mode: 'cors', // 显式启用CORS
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '无法获取错误详情');
            console.error('API错误响应:', errorBody);
            alert(`音乐API请求失败 (${response.status}):\n${errorBody}`);
            return null;
        }

        const result = await response.json();
        // 添加以下代码播放音乐
        if (result && result.data && result.data.raw_llm_response) {
            const audioUrl = result.data.raw_llm_response;
            console.log('获取音乐URL成功:', audioUrl);
            
            // 创建或更新音频元素
            let audioElement = document.getElementById('musicPlayer');
            if (!audioElement) {
                audioElement = new Audio();
                audioElement.id = 'musicPlayer';
                document.body.appendChild(audioElement);
            }
            
            // 设置音频源并播放
            audioElement.src = audioUrl;
            try {
                await audioElement.play();
                console.log('音乐播放开始');
                // 更新播放按钮状态
                updatePlayButtonState(true);
                // 开始更新进度条
                startUpdatingProgress(audioElement);
            } catch (playError) {
                console.error('播放失败:', playError);
                alert('音乐播放失败: ' + playError.message);
            }
            return audioUrl;
        } else {
            console.error('未找到有效的音乐URL', result);
            alert('未找到有效的音乐URL');
            return null;
        }
    } catch (error) {
        // 3. 更精确的错误类型判断
        if (error.name === 'AbortError') {
            console.log('请求超时或已取消');
            alert('请求音乐超时，请稍后重试');
        } else if (error.message.includes('CORS')) {
            console.error('CORS错误详情:', error);
            alert('跨域访问被阻止，请检查后端CORS配置\n详细信息请查看控制台');
        } else if (error.name === 'TypeError') {
            console.error('网络错误:', error);
            alert('无法连接到音乐服务器，请确认后端服务已启动');
        } else {
            console.error('未知错误:', error);
            alert('获取音乐失败: ' + error.message);
        }
        return null;
    }
}

function updatePlayButtonState(isPlaying) {
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.textContent = isPlaying ? '❚❚' : '▶';
        playButton.classList.toggle('playing', isPlaying);
    }
}

function startUpdatingProgress(audioElement) {
    const progressBar = document.querySelector('.progress');
    const timeDisplay = document.querySelector('.time');
    
    if (!progressBar || !timeDisplay) return;
    
    const updateProgress = () => {
        if (audioElement.duration) {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = `${progress}%`;
            
            // 更新时间显示
            const currentTime = formatTime(audioElement.currentTime);
            const duration = formatTime(audioElement.duration);
            timeDisplay.textContent = `${currentTime} / ${duration}`;
        }
    };
    
    // 清除之前的定时器防止多重更新
    if (audioElement.progressInterval) {
        clearInterval(audioElement.progressInterval);
    }
    
    // 创建新的定时器每秒更新进度
    audioElement.progressInterval = setInterval(updateProgress, 1000);
    
    // 音乐结束时清除定时器
    audioElement.addEventListener('ended', () => {
        clearInterval(audioElement.progressInterval);
    });
}

// 创建音频元素
function createAudioElement() {
    const audio = document.createElement('audio');
    audio.id = 'musicPlayer';
    audio.style.display = 'none';
    document.body.appendChild(audio);
    return audio;
}
// 更新进度条和时间显示
function updateProgressDisplay(audio, progressBar, timeDisplay) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    const currentTime = formatTime(audio.currentTime);
    const totalTime = formatTime(audio.duration || 0);
    timeDisplay.textContent = `${currentTime} / ${totalTime}`;
}

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在encounter页面
    // if (window.location.pathname.includes('encounter.html')) {
        initEncounterChat();
    // }
});

// 初始化对话功能
function initEncounterChat() {
    c
    // 修改1：获取新的按钮和表单元素
    const myMessageTextarea = document.querySelector('#myMessageForm textarea');
    const parallelMessageTextarea = document.querySelector('#parallelMessageForm textarea');
    const commonSendButton = document.getElementById('commonSendButton');
    if (!commonSendButton) {
        console.error('共用发送按钮不存在，请检查HTML元素ID是否为commonSendButton');
        return;
    }
    const charCountElements = document.querySelectorAll('.char-count');

    // 修改2：初始化两个表单的字数统计
    [myMessageTextarea, parallelMessageTextarea].forEach((textarea, index) => {
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCountElements[index].textContent = `${length}/200`;
            charCountElements[index].style.color = length > 200 ? '#ef4444' : 'rgba(255, 255, 255, 0.6)';
        });
    });

    // 修改3：绑定新按钮点击事件
    commonSendButton.addEventListener('click', sendCombinedMessage);

    // 修改4：回车发送支持（两个文本框都支持）
    [myMessageTextarea, parallelMessageTextarea].forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendCombinedMessage();
            }
        });
    });

    // 新增：创建视频播放区域
    const videoContainer = createVideoPlayerArea();
    const videoPlayer = document.getElementById('videoPlayer');

    // 新增：合并发送函数
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
        }) .then(response => response.json())
            .then(result => {
                if (result.code === 200 && result.data.success) {
                    const videoUrl = result.data.raw_llm_response.replace(/[`'\s]/g, '');
                    videoPlayer.src = videoUrl;
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

/**
 * 初始化消息表单
 * @param {string} formId - 表单ID
 * @param {string} apiEndpoint - 后端API端点
 */
function initMessageForm(formId, apiEndpoint) {
    const form = document.getElementById(formId);
    if (!form) return;

    const textarea = form.querySelector('textarea');
    const charCount = form.querySelector('.char-count');

    // 监听输入事件，更新字数统计
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/200`;
        // 超过字数限制时改变颜色
        charCount.style.color = length > 200 ? '#ff4444' : '#ccc';
    });

    // 监听表单提交事件
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = textarea.value.trim();

        if (!message) {
            alert('请输入内容后再发送');
            return;
        }

        const sendButton = form.querySelector('.btn-send');
        const originalText = sendButton.textContent;

        try {
            // 禁用按钮并显示加载状态
            sendButton.disabled = true;
            sendButton.textContent = '发送中...';

            // 调用后端API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: escapeHTML(message) })
            });

            if (!response.ok) throw new Error('提交失败，请重试');

            // 清空输入框
            textarea.value = '';
            charCount.textContent = '0/200';

            // 显示成功提示
            alert('消息发送成功！');

        } catch (error) {
            console.error('发送失败:', error);
            alert(`发送失败: ${error.message}`);
        } finally {
            // 恢复按钮状态
            sendButton.disabled = false;
            sendButton.textContent = originalText;
        }
    });
}

// 添加视频播放区域
function createVideoPlayerArea() {
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
    // 初始化表单字数统计
    // initCharacterCount('myMessageForm');
    // initCharacterCount('parallelMessageForm');
    initMessageForm('myMessageForm', '/api/send-my-message');
    initMessageForm('parallelMessageForm', '/api/send-parallel-message');
    // 创建视频播放区域
    const videoContainer = createVideoPlayerArea();
    const videoPlayer = document.getElementById('videoPlayer');
    
    // 共用发送按钮点击事件
    document.getElementById('commonSendButton').addEventListener('click', async function() {
        const sendButton = this;
        const originalText = sendButton.textContent;
        
        // 获取两个表单的输入值
        const currentTrack = document.querySelector('#myMessageForm textarea').value.trim();
        const unchosenTrack = document.querySelector('#parallelMessageForm textarea').value.trim();
        
        // 表单验证
        if (!currentTrack || !unchosenTrack) {
            alert('请填写两个表单的内容后再发送');
            return;
        }
        
        try {
            // 禁用按钮并显示加载状态
            sendButton.disabled = true;
            sendButton.textContent = '生成中...';
            
            // 构建请求参数
            const requestData = {
                current_track: currentTrack,
                unchosen_track: unchosenTrack,
                user_name: 'wangwang'  // 默认用户名
            };
            
            // 调用后端API
            const response = await fetch('http://localhost:8000/api/v1/generate/video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            
            // 检查API返回状态
            if (response.ok && result.code === 200 && result.data.success) {
                // 提取视频URL（处理可能的引号和空格）
                const videoUrl = result.data.raw_llm_response.replace(/[`'\s]/g, '');
                
                // 设置视频源并播放
                videoPlayer.src = videoUrl;
                videoContainer.classList.add('active');
                
                // 滚动到视频区域
                videoContainer.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.msg || '生成视频失败，请重试');
            }
        } catch (error) {
            console.error('API调用失败:', error);
            alert(`操作失败: ${error.message}`);
        } finally {
            // 恢复按钮状态
            sendButton.disabled = false;
            sendButton.textContent = originalText;
        }
    });
});

/**
 * 初始化表单字数统计
 */
function initCharacterCount(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const textarea = form.querySelector('textarea');
    const charCount = form.querySelector('.char-count');
    
    // 移除表单原有的提交按钮
    const submitButton = form.querySelector('.btn-send');
    if (submitButton) submitButton.remove();
    
    // 监听输入事件，更新字数统计
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/200`;
        charCount.style.color = length > 200 ? '#ff4444' : '#ccc';
    });
}


