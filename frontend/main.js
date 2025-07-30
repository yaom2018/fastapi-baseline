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

// 音乐播放器功能
const playButton = document.getElementById('playButton');
let isPlaying = false;
let audioElement = null;

if (playButton) {
    playButton.addEventListener('click', async () => {
        if (!audioElement) {
            audioElement = createAudioElement();
        }

        const progressBar = document.querySelector('.progress');
        const timeDisplay = document.querySelector('.time');

        // if (!isPlaying) {
        //     // 获取音乐URL并播放
        //     const musicUrl = await fetchMusicUrl('宝宝肚肚打雷了');
        //     if (musicUrl) {
        //         audioElement.src = musicUrl;
        //         try {
        //             await audioElement.play();
        //             isPlaying = true;
        //             playButton.textContent = '❚❚'; // 更改按钮为暂停图标
        //             playButton.classList.add('playing');

        //             // 监听时间更新事件
        //             audioElement.addEventListener('timeupdate', () => {
        //                 updateProgressDisplay(audioElement, progressBar, timeDisplay);
        //             });

        //             // 音乐结束时重置状态
        //             audioElement.addEventListener('ended', () => {
        //                 isPlaying = false;
        //                 playButton.textContent = '▶';
        //                 playButton.classList.remove('playing');
        //                 progressBar.style.width = '0%';
        //                 timeDisplay.textContent = '0:00 / 0:00';
        //             });
        //         } catch (error) {
        //             console.error('播放失败:', error);
        //             alert('无法播放音乐: ' + error.message);
        //         }
        //     }
        // } else {
        //     // 暂停音乐
        //     audioElement.pause();
        //     isPlaying = false;
        //     playButton.textContent = '▶'; // 更改按钮为播放图标
        //     playButton.classList.remove('playing');
        // }
        if (!isPlaying) {
            // 显示等待状态
            playButton.textContent = '⏳'; // 更改按钮为等待图标
            playButton.classList.add('loading');
            playButton.disabled = true; // 禁用按钮防止重复点击

            try {
                // 获取音乐URL并播放
                const musicUrl = await fetchMusicUrl('宝宝肚肚打雷了');
                
                if (musicUrl) {
                    audioElement.src = musicUrl;
                    await audioElement.play();
                    isPlaying = true;
                    playButton.textContent = '❚❚'; // 更改按钮为暂停图标
                    playButton.classList.remove('loading');
                    playButton.classList.add('playing');
                    playButton.disabled = false; // 重新启用按钮

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
                } else {
                    // 获取URL失败，重置按钮状态
                    playButton.textContent = '▶';
                    playButton.classList.remove('loading');
                    playButton.disabled = false;
                }
            } catch (error) {
                console.error('播放失败:', error);
                alert('无法播放音乐: ' + error.message);
                // 播放失败，重置按钮状态
                playButton.textContent = '▶';
                playButton.classList.remove('loading');
                playButton.disabled = false;
            }
        } else {
            // 暂停音乐
            audioElement.pause();
            isPlaying = false;
            playButton.textContent = '▶'; // 更改按钮为播放图标
            playButton.classList.remove('playing');
        }
    });
}

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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const apiUrl = 'http://127.0.0.1:8000/api/v1/generate/music';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',              
            },
            body: JSON.stringify({ prompt: prompt }),
            mode: 'cors',
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '无法获取错误详情');
            console.error('API错误响应:', errorBody);
            alert(`音乐API请求失败 (${response.status}):\n${errorBody}`);
            return null;
        }

        const result = await response.json();
        if (result && result.data && result.data.raw_llm_response) {
            return result.data.raw_llm_response;
        } else {
            console.error('未找到有效的音乐URL', result);
            alert('未找到有效的音乐URL');
            return null;
        }
    } catch (error) {
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

function createAudioElement() {
    const audio = document.createElement('audio');
    audio.id = 'musicPlayer';
    audio.style.display = 'none';
    document.body.appendChild(audio);
    return audio;
}

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

// 在文件末尾添加
window.addEventListener('load', function() {
    // 确保移除body上的aria-hidden属性
    document.body.removeAttribute('aria-hidden');
});