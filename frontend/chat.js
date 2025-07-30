// 消息字数统计
const messageInput = document.getElementById('messageInput');
const charCount = document.getElementById('charCount');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');

// 字数统计功能
messageInput.addEventListener('input', () => {
    const count = messageInput.value.length;
    charCount.textContent = `${count}/300`;
    // 根据字数启用/禁用发送按钮
    sendButton.disabled = count === 0 || count > 300;
});

// 发送消息功能
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


function sendMessage() {
  console.log('sendMessage function called');
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  
  console.log('Message input value:', message);
  
  if (message && message.length <= 200) {
    console.log('Message is valid, adding to chat');
    // 添加用户消息
    addMessageToChat('user', message);
    input.value = '';
    updateCharacterCount();
    
    // 显示加载状态
    const loadingMessageId = addLoadingIndicator();
    console.log('Loading indicator added with ID:', loadingMessageId);
    
    // 调用API获取响应
    generateResponse(message)
      .then(responseText => {
        console.log('API call successful, response text:', responseText);
        // 移除加载状态并显示实际响应
        removeLoadingIndicator(loadingMessageId);
        addMessageToChat('parallel', responseText);
      })
      .catch(error => {
        console.error('API call failed:', error);
        removeLoadingIndicator(loadingMessageId);
        addMessageToChat('system', '获取响应失败: ' + error.message);
      });
  } else {
    console.log('Message is invalid or too long');
    if (!message) {
      addMessageToChat('system', '请输入消息内容');
    } else {
      addMessageToChat('system', '消息长度不能超过200个字符');
    }
  }
}

function addMessageToChat(sender, text) {
  console.log('addMessageToChat called with sender:', sender, 'and text:', text);
  const chatContainer = document.getElementById('chat-container');
  if (!chatContainer) {
    console.error('chat-container element not found');
    return;
  }
  
  // ... existing message creation code ...
  
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  console.log('Message added to chat container');
}

// 生成平行宇宙回应（简单模拟）
async function generateResponse(userMessage) {
  console.log('generateResponse called with message:', userMessage);
  
  try {
    // 构造请求数据
    const requestData = {
      prompt: userMessage
    };
    console.log('Request data:', requestData);
    
    // 使用用户提供的正确API路径
    console.log('Sending request to:', 'http://localhost:8000/api/v1/generate/chat');
    const response = await fetch('http://localhost:8000/api/v1/generate/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('Response received with status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP error details:', errorText);
      throw new Error(`HTTP错误: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Response JSON:', data);
    
    // 验证响应格式
    if (data.code !== 200 || !data.data || typeof data.data.raw_llm_response !== 'string') {
      throw new Error(`API响应错误: ${data.msg || '未知错误'}`);
    }
    
    // 移除raw_llm_response外层引号
    let rawResponse = data.data.raw_llm_response;
    if (rawResponse.startsWith('"') && rawResponse.endsWith('"')) {
      rawResponse = rawResponse.slice(1, -1);
    }
    
    console.log('Processed response text:', rawResponse);
    return rawResponse;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error;
  }
}

function addLoadingIndicator() {
  const chatContainer = document.getElementById('chat-container');
  const loadingId = 'loading-' + Date.now();
  const loadingElement = document.createElement('div');
  loadingElement.id = loadingId;
  loadingElement.className = 'message loading';
  loadingElement.innerHTML = '<div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
  chatContainer.appendChild(loadingElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return loadingId;
}

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
window.addEventListener('load', () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
});