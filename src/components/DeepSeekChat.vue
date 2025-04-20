<template>
  <div class="chat-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="logo-container">
        <el-icon class="logo-icon"><Grape /></el-icon>
        <h1 class="logo-text">天道葡萄园中控</h1>
      </div>
      <div class="settings-icon">
        <el-tooltip content="打开设置" placement="top">
          <el-button @click="showSettings = true" :icon="Setting" circle></el-button>
        </el-tooltip>
      </div>
    </el-header>

    <div class="chat-content">
      <!-- 左侧对话列表 -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <el-button type="primary" @click="createNewChat" :icon="Plus" plain>新对话</el-button>
        </div>
        
        <!-- 添加葡萄品种列表区域 -->
        <div class="grape-variety-section">
          <div class="section-header">
            <el-icon><Grape /></el-icon>
            <span>葡萄品种助手</span>
          </div>
          <div class="grape-varieties-list">
            <el-skeleton :rows="3" animated v-if="loadingGrapeData" />
            <template v-else>
              <div v-for="grape in grapeVarieties" :key="grape.id" class="grape-variety-item">
                <div class="grape-info">
                  <div class="grape-name">
                    {{ grape.variety }} ({{ grape.cropName }})
                  </div>
                  <div class="grape-cycle">生长周期: {{ grape.growthCycle || '未知' }}天</div>
                  
                  <!-- 如果有实际种植记录，显示田块信息 -->
                  <div class="grape-planting-info" v-if="getGrapeGrowingInfo(grape) && getGrapeGrowingInfo(grape).length > 0">
                    <div class="planting-badge">
                      <el-tag size="small" type="success">正在种植</el-tag>
                    </div>
                    <div class="planting-detail">{{ getGrapeGrowingInfo(grape).length }}个田块</div>
                  </div>
                </div>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="askAboutGrape(grape)"
                >咨询</el-button>
              </div>
            </template>
          </div>
        </div>
        
        <div class="chat-list">
          <div 
            v-for="(chat, index) in chatHistory" 
            :key="index" 
            class="chat-item" 
            :class="{ active: currentChatIndex === index }"
            @click="selectChat(index)"
          >
            <div class="chat-item-title">{{ chat.title || '新对话' }}</div>
            <div class="chat-item-actions">
              <el-tooltip content="删除对话" placement="top">
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  circle 
                  size="small" 
                  @click.stop="deleteChat(index)"
                ></el-button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧对话内容 -->
      <div class="chat-main">
        <div class="header-section">
          <div class="left">
            <h2 class="page-title">{{ currentChat?.title || '葡萄园智能客服' }}</h2>
          </div>
          <div class="right">
            <div class="model-badge">
              <el-tag type="info">DeepSeek V3</el-tag>
            </div>
          </div>
        </div>
        
        <!-- 对话内容区 -->
        <div class="chat-messages" ref="messagesRef">
          <template v-if="currentChat && currentChat.messages.length > 0">
            <div 
              v-for="(message, idx) in currentChat.messages" 
              :key="idx"
              :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
            >
              <div class="message-avatar">
                <el-avatar :icon="message.role === 'user' ? User : ChatDotRound" :size="36" />
              </div>
              <div class="message-content">
                <div class="message-text" v-html="idx === currentChat.messages.length - 1 && message.role === 'assistant' && isLoading ? formatMessage(currentResponse) : formatMessage(message.content)"></div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </template>
          <div v-else class="empty-chat">
            <div class="empty-chat-content">
              <el-icon class="empty-icon"><ChatDotRound /></el-icon>
              <div class="empty-title">欢迎使用葡萄园智能客服</div>
              <div class="empty-text">有什么想了解的葡萄相关问题，请随时询问！</div>
              <div class="grape-helper-tip">
                <el-icon><Grape /></el-icon>
                <span>您也可以点击左侧"葡萄品种助手"中的按钮，了解特定葡萄品种的信息。</span>
              </div>
            </div>
          </div>
          <!-- 添加底部填充区域，防止内容被输入框遮挡 -->
          <div class="bottom-padding"></div>
        </div>
        
        <!-- 加载动画 -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <!-- 输入框 -->
        <div class="chat-input">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="在此输入消息..."
            resize="none"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.alt.exact.prevent="insertNewLine"
            class="custom-input"
          >
          </el-input>
          <div class="input-actions">
            <div class="input-hint">按 Enter 发送，Alt+Enter 换行</div>
            <el-button type="primary" @click="sendMessage" :disabled="isLoading || !userInput.trim()" class="send-button">
              <el-icon class="send-icon"><Right /></el-icon>
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- API设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="智能客服API设置"
      width="500px"
    >
      <el-form :model="apiSettings" label-width="120px">
        <el-form-item label="API Key">
          <el-input
            v-model="apiSettings.apiKey"
            placeholder="输入您的 SiliconFlow API Key"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <div class="api-key-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>如不输入，将使用系统内置的API Key。如有自己的Key，请在上方输入。通过SiliconFlow API访问DeepSeek V3模型。</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetApiKey">清除Key</el-button>
          <el-button type="primary" @click="saveApiSettings">
            保存设置
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Grape, ChatDotRound, Delete, Plus, Setting, User, InfoFilled, Right } from '@element-plus/icons-vue';
import axios from 'axios';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true
});

const router = useRouter();
const messagesRef = ref(null);
const userInfo = ref({ username: '' });
const isLoading = ref(false);
const userInput = ref('');
const showSettings = ref(false);

// 葡萄品种数据
const grapeVarieties = ref([]);
const loadingGrapeData = ref(false);

// 添加田块作物关系数据
const fieldCropData = ref([]);
const loadingFieldCropData = ref(false);

// 添加田块数据字典
const fieldDict = ref({});

// API 设置
const DEFAULT_API_KEY = 'sk-wupunlvmnqkwrgskmveynnileaewezdkfgnsjgluhcmmjjgd';
const apiSettings = reactive({
  apiKey: localStorage.getItem('deepseek_api_key') || ''
});

// 聊天相关
const chatHistory = ref([]);
const currentChatIndex = ref(0);
const currentChat = computed(() => 
  chatHistory.value.length > 0 ? chatHistory.value[currentChatIndex.value] : null
);

// 用于立即显示的当前响应文本
const currentResponse = ref('');

// 添加工具使用记录数据
const toolUsageRecords = ref([]);
const currentYear = new Date().getFullYear();
const loadingGrapeDetails = ref(false);

// 添加一个系统提示，确保AI以葡萄园客服人员身份回答
const SYSTEM_PROMPT = `你是天道葡萄园的专业客服人员，负责解答顾客关于葡萄品种、采摘、购买和消费的问题。

葡萄园基本信息：
- 地址：四川省达州市宣汉县明月乡大渔池村学校旁
- 联系电话：18682875253
- 营业时间：上午8:00-下午6:00，全年无休

回答规则：
1. 直接回答问题，不要用教学的口吻
2. 使用友好、专业的语气，就像你是葡萄园的资深员工
3. 如果被问到种植技术细节(如施肥、修剪、病虫害防治等)，先查看提供的管理记录回答，没有相关记录时基于四川葡萄种植的标准做法回答
4. 永远以"我们葡萄园"的第一人称回答，如"我们葡萄园的赤霞珠..."
5. 回答要简洁明了，突出葡萄的特色和采摘时间
6. 涉及价格相关问题时，必须强调"价格以现场实际标价为准，因季节变化价格可能有较大波动"
7. 如果顾客询问葡萄园位置或联系方式，请提供完整的地址和电话信息

记住：你是在代表天道葡萄园与顾客交流，不是在教授葡萄种植知识。`;

// 加载葡萄品种数据
const loadGrapeVarieties = async () => {
  loadingGrapeData.value = true;
  try {
    // 1. 先获取葡萄作物信息
    const response = await axios.get('/api/crop/list');
    if (response.data && response.data.code === 200 && response.data.data) {
      grapeVarieties.value = response.data.data.filter(crop => crop.status === 1);
      console.log('加载葡萄品种数据成功:', grapeVarieties.value);
      
      // 2. 加载田块作物关系数据
      await loadFieldCropData();
    } else {
      console.warn('获取葡萄品种列表失败:', response);
    }
  } catch (error) {
    console.error('加载葡萄品种数据错误:', error);
    ElMessage.error('获取葡萄品种信息失败');
  } finally {
    loadingGrapeData.value = false;
  }
};

// 加载田块数据
const loadFieldData = async () => {
  try {
    const response = await axios.get('/api/field/list');
    if (response.data && response.data.code === 200 && response.data.data) {
      // 将田块数据转换为字典格式，方便查询
      const fields = response.data.data;
      const dict = {};
      fields.forEach(field => {
        dict[field.id] = field;
      });
      fieldDict.value = dict;
    } else {
      console.warn('获取田块数据失败');
    }
  } catch (error) {
    console.error('加载田块数据错误:', error);
  }
};

// 加载田块作物关系数据
const loadFieldCropData = async () => {
  loadingFieldCropData.value = true;
  try {
    // 确保田块数据已加载
    if (Object.keys(fieldDict.value).length === 0) {
      await loadFieldData();
    }
    
    // 获取当前年份
    const currentYear = new Date().getFullYear();
    
    // 获取田块作物关系数据
    const response = await axios.get(`/api/fieldcrop/getByYearAndIds?plantingYear=${currentYear}`);
    if (response.data && response.data.code === 200 && response.data.data) {
      fieldCropData.value = response.data.data;
      console.log('加载田块作物关系数据成功:', fieldCropData.value);
    } else {
      console.warn('获取田块作物关系数据失败');
    }
  } catch (error) {
    console.error('加载田块作物关系数据错误:', error);
  } finally {
    loadingFieldCropData.value = false;
  }
};

// 加载当前年份的工具使用记录
const loadToolUsageRecords = async () => {
  try {
    // 获取当前年份
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    
    const response = await axios.get('/api/toolusage/listByDateRange', {
      params: {
        startDate,
        endDate
      }
    });
    
    if (response.data && response.data.code === 200 && response.data.data) {
      toolUsageRecords.value = response.data.data;
      console.log('加载工具使用记录成功:', toolUsageRecords.value.length);
    } else {
      console.warn('获取工具使用记录失败');
      toolUsageRecords.value = [];
    }
  } catch (error) {
    console.error('加载工具使用记录错误:', error);
    toolUsageRecords.value = [];
  }
};

// 获取田块相关的工具使用记录
const getToolUsageForField = (fieldCode) => {
  // 从usageArea字段查找包含该田块编号的记录
  return toolUsageRecords.value.filter(record => 
    record.usageArea && record.usageArea.includes(fieldCode)
  );
};

// 根据工具使用记录提取管理活动信息
const extractManagementActivities = (usageRecords) => {
  if (!usageRecords || usageRecords.length === 0) {
    return [];
  }
  
  // 按时间排序
  const sortedRecords = [...usageRecords].sort((a, b) => {
    return new Date(a.startTime) - new Date(b.startTime);
  });
  
  // 转换为管理活动
  return sortedRecords.map(record => {
    // 计算持续时间（小时）
    let duration = record.usageHours || 0;
    if (!duration && record.startTime && record.endTime) {
      const start = new Date(record.startTime);
      const end = new Date(record.endTime);
      duration = (end - start) / (1000 * 60 * 60); // 转换为小时
    }
    
    return {
      date: record.usageDate,
      startTime: record.startTime,
      endTime: record.endTime,
      activity: record.usagePurpose || '未指定活动',
      area: record.usageArea,
      duration: duration.toFixed(1),
      tool: record.tool ? record.tool.toolName : '未指定工具',
      employee: record.employee ? record.employee.name : '未指定人员'
    };
  });
};

// 获取葡萄品种的种植情况和管理活动
const getGrapeGrowingInfo = (grape) => {
  // 查找该葡萄品种对应的田块种植关系
  const cropPlantings = fieldCropData.value.filter(fc => fc.cropId === grape.id);
  
  if (cropPlantings.length === 0) {
    return null;
  }
  
  return cropPlantings.map(planting => {
    const field = fieldDict.value[planting.fieldId];
    const fieldName = field ? field.fieldName : '未知田块';
    const fieldCode = field ? field.fieldCode : '';
    
    // 获取该田块的工具使用记录
    const usageRecords = getToolUsageForField(fieldCode);
    const managementActivities = extractManagementActivities(usageRecords);
    
    return {
      fieldId: planting.fieldId,
      fieldName,
      fieldCode,
      plantArea: planting.plantArea,
      plantMonth: planting.plantMonth || 3, // 默认3月
      plantCount: planting.plantCount,
      estimatedYield: planting.estimatedYield,
      frameType: planting.frameType,
      irrigationType: planting.irrigationType,
      fertilizationType: planting.fertilizationType,
      status: planting.status, // 0-已结束，1-生长中
      managementActivities
    };
  });
};

// 为特定葡萄品种生成提示词
const generateGrapePrompt = (grape) => {
  // 获取种植情况
  const growingInfo = getGrapeGrowingInfo(grape);
  
  let plantingDetails = '';
  let managementDetails = '';
  
  if (growingInfo && growingInfo.length > 0) {
    plantingDetails = '\n\n我们天道葡萄园当前种植情况：\n';
    
    growingInfo.forEach((info, index) => {
      plantingDetails += `- 田块：${info.fieldName} (${info.fieldCode})\n`;
      plantingDetails += `  种植面积：${info.plantArea}亩\n`;
      plantingDetails += `  种植数量：约${info.plantCount}株\n`;
      plantingDetails += `  预估产量：${info.estimatedYield}kg\n`;
      plantingDetails += `  种植月份：${info.plantMonth}月\n`;
      
      // 计算预计成熟期（种植月份 + 生长周期/30天）
      const growthMonths = Math.ceil((grape.growthCycle || 150) / 30);
      const harvestMonth = ((info.plantMonth || 3) + growthMonths) % 12 || 12;
      plantingDetails += `  预计成熟期：${harvestMonth}月\n`;
      
      plantingDetails += `  生长状态：${info.status === 1 ? '生长中' : '已结束'}\n`;
      plantingDetails += `  种植方式：${info.frameType || '标准架式'}\n`;
      
      // 添加管理活动信息
      if (info.managementActivities && info.managementActivities.length > 0) {
        managementDetails += `\n${info.fieldName}田块的管理活动：\n`;
        info.managementActivities.forEach((activity, idx) => {
          managementDetails += `  ${idx+1}. ${activity.date}：${activity.activity}，使用${activity.tool}，持续约${activity.duration}小时\n`;
        });
      }
    });
  }

  // 添加四川葡萄种植的标准做法，用于在没有具体数据时回答
  const sichuanGrapeGuidelines = `
如果用户询问具体种植技术问题且上述管理记录中没有相关信息，请使用以下四川葡萄种植标准做法回答：

- 施肥方案：基肥(有机肥为主)、芽前肥(氮肥为主)、花前肥(磷钾肥为主)、膨果肥(钾肥为主)、秋施基肥(有机肥+复合肥)
- 病虫害防治：主要防治葡萄霜霉病、白粉病、黑痘病，使用25%丙森锌可湿性粉剂、70%甲基托布津可湿性粉剂等
- 水分管理：采用滴灌技术，生长期保持土壤相对湿度60-70%
- 修剪标准：冬季短梢修剪，每个结果枝组保留2-3个芽，夏季去除过密枝叶
- 果实管理：每穗保留8-10个小果穗，每个结果枝留1-2个果穗，每亩产量控制在1500-2000公斤
- 种植密度：行距2.5-3米，株距1.5-2米，每亩种植约100-120株

请注意，以上内容仅作为标准参考，具体会根据我们葡萄园的实际情况和品种特性进行调整。`;

  // 添加价格政策说明
  const pricingPolicy = `
关于价格信息：
- 葡萄价格随季节、品种、品质和市场供需而变化
- 采摘价格一般为市场价的8-9折
- 批发价格需要根据采购数量单独洽谈
- 所有价格以现场实际标价为准，电话或网上咨询的价格仅供参考

请务必在回答任何价格相关问题时，强调"价格以现场实际标价为准，因季节变化价格可能有较大波动"。`;

  return `${SYSTEM_PROMPT}

我需要向顾客介绍天道葡萄园种植的${grape.variety}葡萄品种信息。${plantingDetails}${managementDetails}${sichuanGrapeGuidelines}${pricingPolicy}

顾客想了解以下信息：
1. ${grape.variety}葡萄的特色和口感特点
2. 这种葡萄何时成熟，什么时候可以来园区采摘
3. 购买价格和采摘活动详情
4. 这种葡萄的营养价值和健康益处
5. 如何挑选优质的${grape.variety}葡萄
6. 葡萄的保存方法和食用建议

请直接以葡萄园客服的身份回答，语言要亲切自然，突出我们葡萄园特色，不要用教学的口吻。`;
};

// 生成回答顾客一般问题的提示词
const generateCustomerServicePrompt = (userQuestion) => {
  // 添加葡萄园位置和联系方式
  const locationInfo = `
葡萄园基本信息：
- 地址：四川省达州市宣汉县明月乡大渔池村学校旁
- 联系电话：18682875253
- 营业时间：上午8:00-下午6:00，全年无休`;

  return `${SYSTEM_PROMPT}

${locationInfo}

顾客询问："${userQuestion}"

请直接回答顾客的问题，不要用教学的口吻。如果是关于葡萄种植技术的问题，请基于四川葡萄种植标准做法回答。语言要亲切自然，像葡萄园的客服人员在跟顾客对话。`;
};

// 咨询特定葡萄品种信息
const askAboutGrape = async (grape) => {
  if (isLoading.value) return;
  
  // 设置加载状态
  loadingGrapeDetails.value = true;
  
  // 在界面上显示友好的过渡消息，而非实际的prompt
  const userMessage = `我想了解天道葡萄园种植的${grape.variety}葡萄品种`;
  
  // 不再设置userInput.value，防止文本重复
  // userInput.value = userMessage;
  
  // 在用户界面显示简单的消息
  const userMessageObj = {
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString()
  };
  
  // 检查是否需要创建新对话
  if (!currentChat.value || currentChat.value.messages.length > 0) {
    createNewChat();
  }
  
  // 添加用户消息到对话
  currentChat.value.messages.push(userMessageObj);
  saveChatHistory();
  scrollToBottom();
  
  // 后台生成实际的prompt
  const actualPrompt = generateGrapePrompt(grape);
  
  // 准备发送到API
  await sendToAI(actualPrompt);
  
  // 重置状态
  loadingGrapeDetails.value = false;
};

// 修改sendToAI函数，在AI回复完成后生成标题
const sendToAI = async (promptText) => {
  if (!promptText || isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    // 提取之前的消息上下文（除了最后一条用户消息）
    const previousMessages = currentChat.value.messages.length > 1 
      ? currentChat.value.messages.slice(0, -1).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      : [];
    
    // 构建消息历史，使用实际的prompt替换最后一条用户消息
    const messages = [
      // 添加系统消息确保AI扮演葡萄园客服
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      ...previousMessages,
      {
        role: 'user',
        content: promptText
      }
    ];
    
    // 创建空的AI回复
    const aiMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    
    // 重置当前响应文本
    currentResponse.value = '';
    
    // 添加空的AI回复到对话中
    currentChat.value.messages.push(aiMessage);
    
    // 确定使用的API Key
    const useApiKey = apiSettings.apiKey || DEFAULT_API_KEY;
    
    // 调用 SiliconFlow API (使用DeepSeek V3模型)
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    let buffer = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // 确保最终内容已更新
        aiMessage.content = currentResponse.value;
        
        // 如果是新对话或对话标题仍是默认标题，则生成新标题
        if (currentChat.value.title === '新对话' || (currentChat.value.messages.length <= 3 && currentChat.value.title === (currentChat.value.messages[0]?.content.length > 20 ? currentChat.value.messages[0].content.substring(0, 20) + '...' : currentChat.value.messages[0]?.content))) {
          await generateChatTitle();
        }
        
        saveChatHistory();
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6).trim();
          
          if (data === '[DONE]') {
            break;
          }
          
          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content || '';
            
            if (content) {
              // 更新当前响应文本和AI消息内容
              currentResponse.value += content;
              // 同步更新AI消息内容
              aiMessage.content = currentResponse.value;
              // 立即保存状态并更新
              saveChatHistory();
              scrollToBottom();
            }
          } catch (e) {
            console.error('解析 SSE 数据失败:', e);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('API 请求失败:', error);
    
    // 添加错误消息
    currentChat.value.messages.pop(); // 移除空的AI消息
    currentChat.value.messages.push({
      role: 'assistant',
      content: `请求失败: ${error.message || '未知错误'}。请检查您的网络连接和 API 密钥。`,
      timestamp: new Date().toISOString()
    });
    
    ElMessage.error('请求失败，请检查网络连接和 API 密钥');
  } finally {
    isLoading.value = false;
    saveChatHistory();
    scrollToBottom();
  }
};

// 添加生成对话标题的函数
const generateChatTitle = async () => {
  // 确保有足够的对话内容
  if (!currentChat.value || currentChat.value.messages.length < 2) return;
  
  try {
    // 准备消息内容用于生成标题
    // 只取前2轮对话（最多4条消息），以保持简洁
    const messagesToSummarize = currentChat.value.messages.slice(0, Math.min(4, currentChat.value.messages.length));
    const conversationText = messagesToSummarize.map(msg => 
      `${msg.role === 'user' ? '用户' : '客服'}：${msg.content}`
    ).join('\n');
    
    // 构建标题生成请求
    const titlePrompt = `你是一个精确的对话标题生成器。请为以下对话生成一个简短的标题（10个字以内），概括主要内容：\n\n${conversationText}\n\n请只返回标题，不需要任何其他解释。`;
    
    // 使用API生成标题
    const useApiKey = apiSettings.apiKey || DEFAULT_API_KEY;
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          {
            role: 'user',
            content: titlePrompt
          }
        ],
        temperature: 0.3, // 使用较低的temperature以获得更确定的答案
        max_tokens: 50,
      })
    });
    
    if (!response.ok) {
      throw new Error('生成标题请求失败');
    }
    
    const data = await response.json();
    let generatedTitle = data.choices[0]?.message?.content || '';
    
    // 清理生成的标题（去除可能的引号、空格等）
    generatedTitle = generatedTitle.replace(/^["']|["']$/g, '').trim();
    
    // 如果生成的标题太长，截断它
    if (generatedTitle.length > 15) {
      generatedTitle = generatedTitle.substring(0, 15) + '...';
    }
    
    // 更新对话标题
    if (generatedTitle) {
      currentChat.value.title = generatedTitle;
      saveChatHistory();
    }
  } catch (error) {
    console.error('生成对话标题失败:', error);
    // 标题生成失败，保持原有标题
  }
};

// 修改发送消息函数，使用sendToAI功能
const sendMessage = async () => {
  const message = userInput.value.trim();
  if (!message || isLoading.value) return;
  
  // 更新 UI
  userInput.value = '';
  
  // 添加用户消息
  const userMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  
  // 只有在没有当前对话时才创建新对话
  if (!currentChat.value) {
    createNewChat();
  }
  
  currentChat.value.messages.push(userMessage);
  
  // 如果是第一条消息，更新对话标题
  if (currentChat.value.messages.length === 1) {
    currentChat.value.title = message.length > 20 ? message.substring(0, 20) + '...' : message;
  }
  
  saveChatHistory();
  scrollToBottom();
  
  // 生成面向用户的提示词
  const customerServicePrompt = generateCustomerServicePrompt(message);
  
  // 发送到AI，使用生成的客服提示词
  await sendToAI(customerServicePrompt);
};

// 保存聊天历史到本地存储
const saveChatHistory = () => {
  localStorage.setItem('deepseek_chat_history', JSON.stringify(chatHistory.value));
};

// 加载聊天历史
const loadChatHistory = () => {
  const savedHistory = localStorage.getItem('deepseek_chat_history');
  if (savedHistory) {
    try {
      chatHistory.value = JSON.parse(savedHistory);
    } catch (e) {
      console.error('解析聊天历史失败:', e);
      chatHistory.value = [];
    }
  }
  
  // 如果没有历史记录，创建一个新对话
  if (chatHistory.value.length === 0) {
    createNewChat();
  }
};

// 创建新对话
const createNewChat = () => {
  chatHistory.value.unshift({
    title: '新对话',
    messages: [],
    createdAt: new Date().toISOString()
  });
  currentChatIndex.value = 0;
  saveChatHistory();
};

// 选择对话
const selectChat = (index) => {
  currentChatIndex.value = index;
};

// 删除对话
const deleteChat = (index) => {
  ElMessageBox.confirm(
    '确定要删除这个对话吗？这个操作不能撤销。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      chatHistory.value.splice(index, 1);
      if (chatHistory.value.length === 0) {
        createNewChat();
      } else if (currentChatIndex.value >= chatHistory.value.length) {
        currentChatIndex.value = chatHistory.value.length - 1;
      }
      saveChatHistory();
      ElMessage.success('对话已删除');
    })
    .catch(() => {});
};

// 处理消息中的代码、链接等
const formatMessage = (content) => {
  if (!content) return '';
  return marked(content);
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return `${diffDay}天前`;
  } else if (diffHour > 0) {
    return `${diffHour}小时前`;
  } else if (diffMin > 0) {
    return `${diffMin}分钟前`;
  } else {
    return '刚刚';
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

// 保存 API 设置
const saveApiSettings = () => {
  localStorage.setItem('deepseek_api_key', apiSettings.apiKey);
  showSettings.value = false;
  ElMessage.success('API 设置已保存');
};

// 重置 API Key
const resetApiKey = () => {
  apiSettings.apiKey = '';
  localStorage.setItem('deepseek_api_key', '');
  ElMessage.success('API Key 已重置，将使用默认Key');
};

// 获取用户信息
const getUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo);
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
};

// 返回仪表盘
const goBackToDashboard = () => {
  router.push('/dashboard');
};

// 退出登录
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  router.push('/');
};

// 监听对话变化自动滚动
watch(
  () => currentChat.value?.messages,
  () => {
    nextTick(scrollToBottom);
  },
  { deep: true }
);

// 组件挂载时执行
onMounted(() => {
  // 自动退出登录
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  
  loadChatHistory();
  loadGrapeVarieties(); // 加载葡萄品种数据
  loadToolUsageRecords(); // 加载工具使用记录
});

// 插入换行
const insertNewLine = () => {
  userInput.value += '\n';
};
</script>

<style scoped>
.chat-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon {
  font-size: 24px;
  color: #8e44ad;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.settings-icon {
  display: flex;
  align-items: center;
}

.chat-content {
  display: flex;
  flex: 1;
  height: calc(100vh - 60px);
  position: relative;
  overflow: hidden;
}

.chat-sidebar {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  z-index: 100;
  overflow: hidden;
}

.sidebar-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

/* 葡萄品种部分样式 */
.grape-variety-section {
  padding: 10px 15px;
  border-bottom: 1px solid #ebeef5;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 8px;
  color: #8e44ad;
  font-weight: 600;
  border-bottom: 1px dashed #e6e6e6;
}

.section-header .el-icon {
  margin-right: 8px;
}

.grape-varieties-list {
  max-height: 300px;
  overflow-y: auto;
}

.grape-variety-item {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  border-left: 3px solid #8e44ad;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.grape-variety-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.grape-info {
  flex: 1;
  overflow: hidden;
}

.grape-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.grape-cycle {
  font-size: 12px;
  color: #606266;
}

/* 添加种植信息相关样式 */
.grape-planting-info {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.planting-badge {
  margin-right: 5px;
}

.planting-detail {
  font-size: 12px;
  color: #67c23a;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  height: calc(100% - 56px - 320px);
}

.chat-item {
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.chat-item:hover {
  background-color: #f5f7fa;
}

.chat-item.active {
  background-color: #ecf5ff;
}

.chat-item-title {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.chat-item-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.chat-item:hover .chat-item-actions {
  opacity: 1;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  margin-left: 300px;
  width: calc(100% - 300px);
  overflow: hidden;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
}

.left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.right {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.model-badge {
  display: flex;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
  background-color: #f9f9f9;
  background-image: linear-gradient(rgba(155, 89, 182, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(155, 89, 182, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  height: calc(100vh - 60px - 56px);
  margin-bottom: 0;
}

.message {
  display: flex;
  margin-bottom: 24px;
  animation: fadeIn 0.5s;
  position: relative;
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-avatar {
  margin: 0 12px;
}

.user-message .message-avatar :deep(.el-avatar) {
  background-color: #8e44ad;
  box-shadow: 0 4px 8px rgba(142, 68, 173, 0.2);
}

.ai-message .message-avatar :deep(.el-avatar) {
  background-color: #2980b9;
  box-shadow: 0 4px 8px rgba(41, 128, 185, 0.2);
}

.message-content {
  max-width: 50%;
  display: flex;
  flex-direction: column;
}

.user-message .message-content {
  align-items: flex-end;
}

.ai-message .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 15px 18px;
  font-size: 15px;
  line-height: 1.6;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 18px;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

.user-message .message-text {
  background: linear-gradient(135deg, #9B59B6, #8e44ad);
  color: #fff;
  border-radius: 18px 18px 2px 18px;
  box-shadow: 0 5px 15px rgba(142, 68, 173, 0.2);
}

.user-message .message-text::before {
  content: '';
  position: absolute;
  bottom: 0;
  right: -8px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #9B59B6, #8e44ad);
  border-radius: 0 0 0 16px;
  z-index: -1;
}

.ai-message .message-text {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  color: #333;
  border-radius: 18px 18px 18px 2px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #3498db;
}

.ai-message .message-text::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 0 0 16px 0;
  z-index: -1;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  font-weight: 500;
  opacity: 0.8;
}

.user-message:hover .message-time,
.ai-message:hover .message-time {
  opacity: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 适配 markdown 内容 */
:deep(.message-text) {
  overflow-x: visible;
}

:deep(.ai-message .message-text pre) {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 12px;
  margin: 15px 0;
  border-left: 3px solid #3498db;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

:deep(.user-message .message-text pre) {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px;
  margin: 15px 0;
  border-left: 3px solid rgba(255, 255, 255, 0.5);
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

:deep(.message-text code) {
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  padding: 2px 5px;
  border-radius: 4px;
  word-break: break-all;
  white-space: pre-wrap;
}

:deep(.ai-message .message-text code) {
  background-color: rgba(0, 0, 0, 0.05);
  color: #e83e8c;
}

:deep(.user-message .message-text code) {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

:deep(.message-text p) {
  margin: 10px 0;
}

:deep(.message-text a) {
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px dashed;
  transition: all 0.2s ease;
}

:deep(.ai-message .message-text a) {
  color: #3498db;
  border-bottom-color: #3498db;
}

:deep(.ai-message .message-text a:hover) {
  color: #2980b9;
  border-bottom-style: solid;
}

:deep(.user-message .message-text a) {
  color: #f8f9fa;
  border-bottom-color: rgba(255, 255, 255, 0.5);
}

:deep(.user-message .message-text a:hover) {
  color: #ffffff;
  border-bottom-style: solid;
}

:deep(.message-text ul, .message-text ol) {
  padding-left: 20px;
  margin: 12px 0;
}

:deep(.message-text li) {
  margin-bottom: 5px;
}

:deep(.message-text table) {
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
  border-radius: 6px;
  overflow: hidden;
  table-layout: fixed;
}

:deep(.message-text table th, .message-text table td) {
  padding: 8px 13px;
  word-break: break-word;
  overflow-wrap: break-word;
}

:deep(.ai-message .message-text table th, .ai-message .message-text table td) {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.user-message .message-text table th, .user-message .message-text table td) {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.ai-message .message-text table th) {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.user-message .message-text table th) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.message-text blockquote) {
  margin: 12px 0;
  padding: 10px 15px;
  border-radius: 6px;
}

:deep(.ai-message .message-text blockquote) {
  background-color: rgba(0, 0, 0, 0.03);
  border-left: 4px solid #3498db;
  color: #5a6a7e;
}

:deep(.user-message .message-text blockquote) {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 4px solid rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.9);
}

.chat-input {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  position: fixed;
  bottom: 0;
  left: 300px;
  width: calc(100% - 300px);
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

:deep(.custom-input) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.custom-input .el-textarea__inner) {
  border: 2px solid #ebeef5;
  border-radius: 12px;
  padding: 15px;
  font-size: 15px;
  background-color: #f9fafc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

:deep(.custom-input .el-textarea__inner:focus) {
  border-color: #9B59B6;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.1);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.input-hint {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
  background-color: #f5f7fa;
  padding: 4px 10px;
  border-radius: 4px;
}

.send-button {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  background-color: #8e44ad;
  border-color: #8e44ad;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.send-button:hover {
  background-color: #9B59B6;
  border-color: #9B59B6;
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
  transform: translateY(-2px);
}

.send-button:not(:disabled):active {
  background-color: #7D3C98;
  border-color: #7D3C98;
  transform: translateY(0);
}

.send-button:disabled {
  background-color: #E8E8E8;
  border-color: #E8E8E8;
  color: #A0A0A0;
}

.send-icon {
  font-size: 14px;
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.empty-chat-content {
  text-align: center;
  animation: fadeIn 0.5s;
}

.grape-helper-tip {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e44ad;
  font-size: 14px;
}

.grape-helper-tip .el-icon {
  margin-right: 8px;
}

.empty-icon {
  font-size: 50px;
  color: #dcdfe6;
  margin-bottom: 15px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
  color: #909399;
}

.loading-indicator {
  display: flex;
  justify-content: flex-start;
  padding: 0 30px;
  margin-bottom: 20px;
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: #2C3E50;
  display: inline-block;
  margin: 0 3px;
  opacity: 0.4;
}

.typing-indicator span:nth-child(1) {
  animation: blink 1s infinite 0.2s;
}

.typing-indicator span:nth-child(2) {
  animation: blink 1s infinite 0.4s;
}

.typing-indicator span:nth-child(3) {
  animation: blink 1s infinite 0.6s;
}

.api-key-hint {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.api-key-hint .el-icon {
  margin-right: 5px;
  color: #909399;
}

@keyframes blink {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 适配 markdown 内容 */
:deep(.message-text) {
  overflow-x: visible;
}

:deep(.message-text pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 12px;
  margin: 15px 0;
}

:deep(.message-text code) {
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
}

:deep(.message-text p) {
  margin: 10px 0;
}

:deep(.message-text a) {
  color: #0366d6;
  text-decoration: none;
}

:deep(.message-text a:hover) {
  text-decoration: underline;
}

:deep(.message-text ul, .message-text ol) {
  padding-left: 20px;
  margin: 10px 0;
}

:deep(.message-text table) {
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
}

:deep(.message-text table th, .message-text table td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

:deep(.message-text table th) {
  background-color: #f6f8fa;
}

:deep(.message-text blockquote) {
  margin: 10px 0;
  padding: 0 10px;
  color: #6a737d;
  border-left: 4px solid #dfe2e5;
}

:deep(.user-message .message-text code) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #f8f8f2;
}

:deep(.user-message .message-text a) {
  color: #61dafb;
}

/* 底部填充区域，防止内容被输入框遮挡 */
.bottom-padding {
  height: 140px;
  width: 100%;
}
</style> 