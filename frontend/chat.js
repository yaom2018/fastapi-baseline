document.addEventListener('DOMContentLoaded', function() {
    // 获取所有需要的元素
    const messageInput = document.getElementById('message-input');
    const charCount = document.getElementById('char-count');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chatMessages');
    
    // 确保所有元素都存在
    if (!messageInput || !charCount || !sendButton || !chatMessages) {
        console.error('无法找到所有必需的元素');
        return;
    }
    
    // 初始化字符计数
    updateCharacterCount();
    
    // 绑定输入事件
    messageInput.addEventListener('input', updateCharacterCount);
    
    // 绑定发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);
    
    // 绑定回车键发送事件
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 字符计数更新函数
    function updateCharacterCount() {
        const currentLength = messageInput.value.length;
        charCount.textContent = `${currentLength}/200`;
        
        // 根据长度改变颜色提示
        if (currentLength > 180) {
            charCount.style.color = '#ff4444';
        } else if (currentLength > 150) {
            charCount.style.color = '#ffaa00';
        } else {
            charCount.style.color = '#00aa00';
        }
    }
    
    // 发送消息函数
    function sendMessage() {
        const message = messageInput.value.trim();
        
        if (message && message.length <= 200) {
            // 添加用户消息
            addMessageToChat('user', message);
            messageInput.value = '';
            updateCharacterCount();
            
            // 显示加载状态
            const loadingMessageId = addLoadingIndicator();
            
            // 调用API获取响应
            generateResponse(message)
                .then(responseText => {
                    removeLoadingIndicator(loadingMessageId);
                    addMessageToChat('parallel', responseText);
                })
                .catch(error => {
                    removeLoadingIndicator(loadingMessageId);
                    addMessageToChat('system', '获取响应失败: ' + error.message);
                });
        } else {
            if (!message) {
                addMessageToChat('system', '请输入消息内容');
            } else {
                addMessageToChat('system', '消息长度不能超过200个字符');
            }
        }
    }
    
    // 添加消息到聊天窗口
    function addMessageToChat(sender, text) {
        const messageElement = document.createElement('div');
        
        if (sender === 'parallel') {
            // 平行宇宙消息结构
            messageElement.className = 'message parallel-message';
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-stars"></div>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${escapeHtml(text)}</p>
                    </div>
                    <div class="message-meta">平行宇宙 · 刚刚</div>
                </div>
            `;
        } else if (sender === 'user') {
            // 用户消息结构
            messageElement.className = 'message user-message';
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${escapeHtml(text)}</p>
                    </div>
                    <div class="message-meta">我 · 刚刚</div>
                </div>
                <div class="message-avatar">
                    <div class="avatar-stars"></div>
                </div>
            `;
        } else {
            // 系统消息
            messageElement.className = 'message system-message';
            messageElement.innerHTML = `
                <div class="message-bubble">
                    <p>${escapeHtml(text)}</p>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 生成平行宇宙回应
    async function generateResponse(userMessage) {
        try {
            // 构造请求数据
            const requestData = {
                prompt: userMessage
            };
            
            // 使用用户提供的API路径
            const response = await fetch('http://47.116.16.113:8000/api/v1/generate/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP错误: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            // 验证响应格式
            if (data.code !== 200 || !data.data || typeof data.data.raw_llm_response !== 'string') {
                throw new Error(`API响应错误: ${data.msg || '未知错误'}`);
            }
            
            // 移除raw_llm_response外层引号
            let rawResponse = data.data.raw_llm_response;
            if (rawResponse.startsWith('"') && rawResponse.endsWith('"')) {
                rawResponse = rawResponse.slice(1, -1);
            }
            
            return rawResponse;
        } catch (error) {
            throw error;
        }
    }
    
    // 添加加载指示器
    function addLoadingIndicator() {
        const loadingId = 'loading-' + Date.now();
        const loadingElement = document.createElement('div');
        loadingElement.id = loadingId;
        loadingElement.className = 'message parallel-message loading';
        loadingElement.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-stars"></div>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(loadingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingId;
    }
    
    // 移除加载指示器
    function removeLoadingIndicator(loadingId) {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    // HTML转义函数
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 页面加载完成时滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
});