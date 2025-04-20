<template>
  <div class="monitor-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="logo-container">
        <el-icon class="logo-icon"><Grape /></el-icon>
        <h1 class="logo-text">天道葡萄园中控</h1>
      </div>
      <div class="user-info">
        <el-dropdown trigger="click">
          <span class="user-dropdown-link">
            {{ userInfo.username || '用户' }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <div class="content-wrapper">
      <div class="header-section">
        <div class="left">
          <el-button type="primary" plain @click="goBackToDashboard" :icon="Back">返回中控</el-button>
          <h2 class="page-title">葡萄园视频监控</h2>
        </div>
        <div class="right">
          <el-select v-model="layout" placeholder="布局选择" @change="rearrangeLayout">
            <el-option label="单摄像头" value="single" />
            <el-option label="双摄像头" value="double" />
            <el-option label="四摄像头" value="quad" />
          </el-select>
          <el-button type="success" @click="startAllVideoStreams" :disabled="isStartingVideo">
            {{ isStartingVideo ? '连接中...' : '全部连接' }}
          </el-button>
          <el-button type="danger" @click="stopAllVideoStreams" :disabled="!hasActiveStream">
            全部断开
          </el-button>
        </div>
      </div>

      <div :class="['video-grid', `layout-${layout}`]">
        <div 
          v-for="(stream, index) in videoStreams" 
          :key="index"
          class="video-container"
          :class="{ 'active': index === activeStreamIndex, 'hide': shouldHideVideo(index) }"
          @click="setActiveStream(index)"
        >
          <div class="video-header">
            <span class="video-title">
              {{ stream.name || `摄像头 ${index + 1}` }}
              <span v-if="stream.type === 'field'" class="field-indicator">
                {{ selectedFieldName(index) }}
              </span>
              <span v-if="stream.isRecording" class="recording-indicator">
                <span class="recording-dot"></span>录制中
              </span>
            </span>
            <div class="video-controls">
              <el-select 
                v-if="stream.type === 'field'" 
                size="small" 
                v-model="stream.fieldId" 
                placeholder="选择田块"
                @change="() => handleFieldChange(index)"
                @click.stop
              >
                <el-option
                  v-for="field in fieldList"
                  :key="field.id"
                  :label="field.name"
                  :value="field.id"
                />
              </el-select>
              <el-button
                size="small"
                :type="stream.isPlaying ? 'danger' : 'success'"
                :icon="stream.isPlaying ? Close : VideoPlay"
                circle
                @click.stop="toggleVideoStream(index)"
              />
              <el-button
                size="small"
                :type="stream.isRecording ? 'danger' : 'warning'"
                :icon="VideoCamera"
                circle
                @click.stop="toggleRecording(index)"
                :disabled="!stream.isPlaying"
                class="record-button"
              />
              <el-button
                size="small"
                type="primary"
                :icon="Setting"
                circle
                @click.stop="openStreamSettings(index)"
              />
            </div>
          </div>
          <video
            ref="videoElements"
            :id="`video-${index}`"
            class="video-player"
            autoplay
            muted
            :class="{ 'no-signal': !stream.isPlaying }"
          ></video>
          <div v-if="!stream.isPlaying" class="no-signal-overlay">
            <el-icon class="no-signal-icon"><VideoCamera /></el-icon>
            <div class="no-signal-text">未连接</div>
            <el-button 
              size="small" 
              type="success" 
              @click.stop="startVideoStream(index)"
              :disabled="isStartingVideo"
            >
              连接
            </el-button>
          </div>
          <div v-if="stream.isRecording" class="recording-time">
            {{ formatRecordingTime(stream.recordingTime) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 视频源设置对话框 -->
    <el-dialog
      v-model="showStreamSettings"
      title="摄像头设置"
      width="500px"
    >
      <el-form :model="currentStreamSettings" label-width="120px">
        <el-form-item label="摄像头名称">
          <el-input v-model="currentStreamSettings.name" placeholder="输入摄像头名称" />
        </el-form-item>
        <el-form-item label="摄像头类型">
          <el-select v-model="currentStreamSettings.type" placeholder="选择摄像头类型">
            <el-option label="普通摄像头" value="normal" />
            <el-option label="田块摄像头" value="field" />
          </el-select>
        </el-form-item>
        <el-form-item label="田块选择" v-if="currentStreamSettings.type === 'field'">
          <el-select v-model="currentStreamSettings.fieldId" placeholder="选择田块">
            <el-option
              v-for="field in fieldList"
              :key="field.id"
              :label="field.name"
              :value="field.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="摄像头设备">
          <el-select 
            v-model="currentStreamSettings.deviceId" 
            placeholder="选择摄像头设备"
            :loading="isLoadingDevices"
          >
            <el-option
              v-for="device in videoDevices"
              :key="device.deviceId"
              :label="device.label || `设备 ${device.deviceId.substring(0, 8)}...`"
              :value="device.deviceId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分辨率">
          <el-select v-model="currentStreamSettings.resolution" placeholder="选择分辨率">
            <el-option label="640 x 480" value="640x480" />
            <el-option label="1280 x 720" value="1280x720" />
            <el-option label="1920 x 1080" value="1920x1080" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showStreamSettings = false">取消</el-button>
          <el-button type="primary" @click="saveStreamSettings">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 录制设置对话框 -->
    <el-dialog
      v-model="showRecordingSettings"
      title="录制设置"
      width="500px"
    >
      <el-form :model="recordingSettings" label-width="120px">
        <el-form-item label="文件名称">
          <el-input v-model="recordingSettings.filename" placeholder="输入录制文件名称（不含扩展名）" />
        </el-form-item>
        <el-form-item label="视频格式">
          <el-select v-model="recordingSettings.format" placeholder="选择视频格式">
            <el-option label="MP4 格式" value="mp4" />
            <el-option label="WebM 格式" value="webm" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频质量">
          <el-select v-model="recordingSettings.quality" placeholder="选择视频质量">
            <el-option label="高质量" value="high" />
            <el-option label="中等质量" value="medium" />
            <el-option label="低质量" value="low" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRecordingSettings = false">取消</el-button>
          <el-button type="primary" @click="saveRecordingSettings">
            确认并开始录制
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Grape, Back, VideoCamera, Setting, VideoPlay, Close } from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const userInfo = ref({ username: '' });
const layout = ref('single'); // 布局类型：single, double, quad

// 视频元素引用
const videoElements = ref([]);

// 是否正在启动视频
const isStartingVideo = ref(false);

// 视频设备列表
const videoDevices = ref([]);
const isLoadingDevices = ref(false);

// 田块列表
const fieldList = ref([]);
const isLoadingFields = ref(false);

// 当前激活的视频流索引
const activeStreamIndex = ref(0);

// 显示视频流设置对话框
const showStreamSettings = ref(false);

// 当前正在设置的视频流
const currentStreamIndex = ref(0);
const currentStreamSettings = reactive({
  name: '',
  type: 'normal', // 'normal' 或 'field'
  fieldId: null,
  deviceId: '',
  resolution: '640x480'
});

// 录制相关
const showRecordingSettings = ref(false);
const recordingSettings = reactive({
  streamIndex: 0,
  filename: '',
  format: 'mp4',
  quality: 'high'
});

// 视频流配置
const videoStreams = ref([
  {
    name: '前置摄像头',
    type: 'normal',
    deviceId: '',
    resolution: '640x480',
    stream: null,
    isPlaying: false,
    mediaRecorder: null,
    isRecording: false,
    recordedChunks: [],
    recordingTime: 0,
    recordingTimer: null
  },
  {
    name: '后置摄像头',
    type: 'normal',
    deviceId: '',
    resolution: '640x480',
    stream: null,
    isPlaying: false,
    mediaRecorder: null,
    isRecording: false,
    recordedChunks: [],
    recordingTime: 0,
    recordingTimer: null
  },
  {
    name: '仓库摄像头',
    type: 'normal',
    deviceId: '',
    resolution: '640x480',
    stream: null,
    isPlaying: false,
    mediaRecorder: null,
    isRecording: false,
    recordedChunks: [],
    recordingTime: 0,
    recordingTimer: null
  },
  {
    name: '田块监控',
    type: 'field',
    fieldId: null,
    deviceId: '',
    resolution: '640x480',
    stream: null,
    isPlaying: false,
    mediaRecorder: null,
    isRecording: false,
    recordedChunks: [],
    recordingTime: 0,
    recordingTimer: null
  }
]);

// 获取田块名称
const selectedFieldName = (index) => {
  const stream = videoStreams.value[index];
  if (stream.type === 'field' && stream.fieldId) {
    const field = fieldList.value.find(f => f.id === stream.fieldId);
    return field ? field.name : '未选择田块';
  }
  return '';
};

// 计算是否有活跃的视频流
const hasActiveStream = computed(() => {
  return videoStreams.value.some(stream => stream.isPlaying);
});

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

// 加载田块列表
const loadFieldList = async () => {
  isLoadingFields.value = true;
  try {
    const response = await axios.get('/api/field/list');
    if (response.data && response.data.code === 200) {
      // 处理响应数据，生成田块列表
      fieldList.value = (response.data.data || []).map(field => ({
        id: field.id,
        name: `${field.fieldName} (${field.fieldCode})`,
        code: field.fieldCode
      }));
      
      // 默认选择第一个田块
      if (fieldList.value.length > 0) {
        const fieldStream = videoStreams.value.find(s => s.type === 'field');
        if (fieldStream && !fieldStream.fieldId) {
          fieldStream.fieldId = fieldList.value[0].id;
        }
      }
    } else {
      console.error('获取田块列表失败:', response);
      fieldList.value = generateMockFieldList(); // 使用模拟数据
    }
  } catch (error) {
    console.error('加载田块列表错误:', error);
    fieldList.value = generateMockFieldList(); // 使用模拟数据
  } finally {
    isLoadingFields.value = false;
  }
};

// 生成模拟田块数据（当API不可用时）
const generateMockFieldList = () => {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    name: `田块 ${i + 1}`,
    code: `F-${String(i + 1).padStart(3, '0')}`
  }));
};

// 处理田块变化
const handleFieldChange = (index) => {
  const stream = videoStreams.value[index];
  if (stream.isPlaying) {
    // 如果正在播放，重新启动流以应用新的田块设置
    stopVideoStream(index);
    startVideoStream(index);
  }
};

// 根据布局判断是否隐藏某个视频流
const shouldHideVideo = (index) => {
  if (layout.value === 'single') {
    return index !== activeStreamIndex.value;
  } else if (layout.value === 'double') {
    return index >= 2;
  }
  return false; // 四摄像头布局不隐藏任何摄像头
};

// 设置当前激活的视频流
const setActiveStream = (index) => {
  if (layout.value === 'single') {
    activeStreamIndex.value = index;
  }
};

// 加载可用的视频设备
const loadVideoDevices = async () => {
  isLoadingDevices.value = true;
  try {
    // 请求媒体设备权限
    await navigator.mediaDevices.getUserMedia({ video: true });
    
    // 获取所有媒体设备
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // 过滤出视频输入设备
    videoDevices.value = devices.filter(device => device.kind === 'videoinput');
    
    // 如果有设备，为默认摄像头设置第一个设备
    if (videoDevices.value.length > 0) {
      videoStreams.value[0].deviceId = videoDevices.value[0].deviceId;
      // 如果有多个设备，为其他摄像头设置不同的设备
      if (videoDevices.value.length > 1) {
        for (let i = 1; i < Math.min(videoStreams.value.length, videoDevices.value.length); i++) {
          videoStreams.value[i].deviceId = videoDevices.value[i].deviceId;
        }
      }
    }
  } catch (error) {
    console.error('加载视频设备失败:', error);
    ElMessage.error('无法访问摄像头，请确保您已授予摄像头权限');
  } finally {
    isLoadingDevices.value = false;
  }
};

// 启动指定索引的视频流
const startVideoStream = async (index) => {
  if (isStartingVideo.value) return;
  
  const stream = videoStreams.value[index];
  if (stream.isPlaying) return;
  
  // 检查田块摄像头是否选择了田块
  if (stream.type === 'field' && !stream.fieldId) {
    ElMessage.warning('请先选择田块');
    return;
  }
  
  isStartingVideo.value = true;
  
  try {
    // 解析分辨率
    const [width, height] = stream.resolution.split('x').map(Number);
    
    // 构建约束条件
    const constraints = {
      video: {
        deviceId: stream.deviceId ? { exact: stream.deviceId } : undefined,
        width: { ideal: width },
        height: { ideal: height }
      }
    };
    
    // 获取媒体流
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // 保存流并更新状态
    stream.stream = mediaStream;
    stream.isPlaying = true;
    
    // 将流连接到视频元素
    nextTick(() => {
      const videoElement = videoElements.value[index];
      if (videoElement) {
        videoElement.srcObject = mediaStream;
        videoElement.play().catch(error => {
          console.error('播放视频失败:', error);
        });
      }
    });
    
    // 显示成功消息
    const successMsg = stream.type === 'field' 
      ? `${stream.name} (${selectedFieldName(index)})已连接` 
      : `${stream.name}已连接`;
    ElMessage.success(successMsg);
  } catch (error) {
    console.error('启动视频流失败:', error);
    ElMessage.error(`连接${stream.name}失败: ${error.message}`);
  } finally {
    isStartingVideo.value = false;
  }
};

// 停止指定索引的视频流
const stopVideoStream = (index) => {
  const stream = videoStreams.value[index];
  
  // 如果正在录制，先停止录制
  if (stream.isRecording) {
    stopRecording(index);
  }
  
  if (!stream.isPlaying) return;
  
  // 停止所有轨道
  if (stream.stream) {
    stream.stream.getTracks().forEach(track => track.stop());
  }
  
  // 重置视频元素
  const videoElement = videoElements.value[index];
  if (videoElement) {
    videoElement.srcObject = null;
  }
  
  // 更新状态
  stream.stream = null;
  stream.isPlaying = false;
  
  ElMessage.warning(`${stream.name}已断开`);
};

// 切换视频流状态
const toggleVideoStream = (index) => {
  const stream = videoStreams.value[index];
  if (stream.isPlaying) {
    stopVideoStream(index);
  } else {
    startVideoStream(index);
  }
};

// 启动所有视频流
const startAllVideoStreams = async () => {
  isStartingVideo.value = true;
  
  const visibleStreams = videoStreams.value.filter((_, index) => !shouldHideVideo(index));
  
  // 使用 Promise.all 并行启动所有视频流
  await Promise.all(visibleStreams.map(async (_, index) => {
    if (!videoStreams.value[index].isPlaying) {
      await startVideoStream(index);
    }
  }));
  
  isStartingVideo.value = false;
};

// 停止所有视频流
const stopAllVideoStreams = () => {
  videoStreams.value.forEach((_, index) => {
    if (videoStreams.value[index].isPlaying) {
      stopVideoStream(index);
    }
  });
};

// 打开视频流设置
const openStreamSettings = (index) => {
  currentStreamIndex.value = index;
  const stream = videoStreams.value[index];
  
  currentStreamSettings.name = stream.name;
  currentStreamSettings.type = stream.type;
  currentStreamSettings.fieldId = stream.fieldId;
  currentStreamSettings.deviceId = stream.deviceId;
  currentStreamSettings.resolution = stream.resolution;
  
  showStreamSettings.value = true;
};

// 保存视频流设置
const saveStreamSettings = () => {
  const index = currentStreamIndex.value;
  const stream = videoStreams.value[index];
  const wasPlaying = stream.isPlaying;
  
  // 如果流正在播放，先停止
  if (wasPlaying) {
    stopVideoStream(index);
  }
  
  // 更新设置
  stream.name = currentStreamSettings.name;
  stream.type = currentStreamSettings.type;
  stream.fieldId = currentStreamSettings.fieldId;
  stream.deviceId = currentStreamSettings.deviceId;
  stream.resolution = currentStreamSettings.resolution;
  
  // 关闭对话框
  showStreamSettings.value = false;
  
  // 如果之前在播放，重启流
  if (wasPlaying) {
    startVideoStream(index);
  }
  
  ElMessage.success('摄像头设置已保存');
};

// 重新排列布局
const rearrangeLayout = () => {
  if (layout.value === 'single') {
    // 确保activeStreamIndex在可见范围内
    if (activeStreamIndex.value >= videoStreams.value.length) {
      activeStreamIndex.value = 0;
    }
  }
};

// 返回仪表盘
const goBackToDashboard = () => {
  // 先停止所有视频流
  stopAllVideoStreams();
  
  // 返回仪表盘
  router.push('/dashboard');
};

// 退出登录
const logout = () => {
  // 先停止所有视频流
  stopAllVideoStreams();
  
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  router.push('/');
};

// 开始录制准备
const prepareRecording = (index) => {
  recordingSettings.streamIndex = index;
  recordingSettings.filename = `${videoStreams.value[index].name}_${new Date().toLocaleString().replace(/[\/\s:,]/g, '_')}`;
  showRecordingSettings.value = true;
};

// 保存录制设置并开始录制
const saveRecordingSettings = () => {
  showRecordingSettings.value = false;
  startRecording(recordingSettings.streamIndex);
};

// 切换录制状态
const toggleRecording = (index) => {
  const stream = videoStreams.value[index];
  if (stream.isRecording) {
    stopRecording(index);
  } else {
    prepareRecording(index);
    showRecordingSettings.value = true;
  }
};

// 开始录制指定索引的视频流
const startRecording = (index) => {
  const stream = videoStreams.value[index];
  if (!stream.isPlaying || stream.isRecording) return;
  
  try {
    // 设置录制选项
    let options = {};
    
    // 根据质量和格式设置适当的比特率
    const videoBitsPerSecond = 
      recordingSettings.quality === 'high' ? 2500000 : 
      recordingSettings.quality === 'medium' ? 1000000 : 500000;
    
    if (recordingSettings.format === 'mp4') {
      options = {
        mimeType: 'video/mp4;codecs=h264',
        videoBitsPerSecond
      };
    } else {
      options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond
      };
    }
    
    // 如果浏览器不支持指定的MIME类型，尝试备用选项
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        options.mimeType = 'video/webm;codecs=vp8';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm';
      } else {
        options = {}; // 使用浏览器默认设置
      }
    }
    
    // 创建MediaRecorder实例
    stream.mediaRecorder = new MediaRecorder(stream.stream, options);
    
    // 重置录制数据
    stream.recordedChunks = [];
    
    // 处理录制数据
    stream.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        stream.recordedChunks.push(event.data);
      }
    };
    
    // 处理录制完成
    stream.mediaRecorder.onstop = () => {
      // 创建Blob
      const mimeType = recordingSettings.format === 'mp4' ? 'video/mp4' : 'video/webm';
      const blob = new Blob(stream.recordedChunks, { type: mimeType });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${recordingSettings.filename}.${recordingSettings.format}`;
      
      // 触发下载
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      // 清除录制计时器
      if (stream.recordingTimer) {
        clearInterval(stream.recordingTimer);
        stream.recordingTimer = null;
      }
      
      // 重置录制时间
      stream.recordingTime = 0;
      
      // 更新UI状态
      stream.isRecording = false;
      
      ElMessage.success(`已保存录制文件: ${recordingSettings.filename}.${recordingSettings.format}`);
    };
    
    // 开始录制
    stream.mediaRecorder.start();
    
    // 更新UI状态
    stream.isRecording = true;
    
    // 设置录制时间计时器
    stream.recordingTimer = setInterval(() => {
      stream.recordingTime += 1;
    }, 1000);
    
    // 显示录制开始消息
    ElMessage.success(`${stream.name} 开始录制`);
  } catch (error) {
    console.error('开始录制失败:', error);
    ElMessage.error(`开始录制失败: ${error.message}`);
  }
};

// 停止录制指定索引的视频流
const stopRecording = (index) => {
  const stream = videoStreams.value[index];
  if (!stream.isRecording) return;
  
  try {
    // 停止MediaRecorder
    if (stream.mediaRecorder && stream.mediaRecorder.state !== 'inactive') {
      stream.mediaRecorder.stop();
    }
  } catch (error) {
    console.error('停止录制失败:', error);
    ElMessage.error(`停止录制失败: ${error.message}`);
    
    // 确保UI状态更新
    stream.isRecording = false;
    
    // 清除录制计时器
    if (stream.recordingTimer) {
      clearInterval(stream.recordingTimer);
      stream.recordingTimer = null;
    }
  }
};

// 格式化录制时间（秒 -> HH:MM:SS）
const formatRecordingTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const padZero = (num) => num.toString().padStart(2, '0');
  
  return `${padZero(hrs)}:${padZero(mins)}:${padZero(secs)}`;
};

// 生命周期钩子
onMounted(async () => {
  getUserInfo();
  await Promise.all([loadVideoDevices(), loadFieldList()]);
  
  // 默认启动第一个摄像头
  if (videoDevices.value.length > 0) {
    startVideoStream(0);
  }
});

onUnmounted(() => {
  // 停止所有录制和视频流
  videoStreams.value.forEach((_, index) => {
    if (videoStreams.value[index].isRecording) {
      stopRecording(index);
    }
    if (videoStreams.value[index].isPlaying) {
      stopVideoStream(index);
    }
  });
});
</script>

<style scoped>
.monitor-container {
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

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.content-wrapper {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.video-grid {
  display: grid;
  gap: 20px;
  flex: 1;
  position: relative;
}

.layout-single {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.layout-double {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
}

.layout-quad {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.video-container {
  position: relative;
  min-height: 300px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.video-container.active {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
  z-index: 10;
}

.video-container.hide {
  display: none;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  z-index: 5;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
}

.field-indicator {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
  color: #67C23A;
}

.video-controls {
  display: flex;
  gap: 5px;
  align-items: center;
}

.video-player {
  width: 100%;
  height: 100%;
  flex: 1;
  object-fit: cover;
  background-color: #000;
}

.video-player.no-signal {
  opacity: 0.3;
}

.no-signal-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 3;
}

.no-signal-icon {
  font-size: 48px;
  color: #dcdfe6;
}

.no-signal-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

/* 田块选择下拉框样式 */
:deep(.el-select.el-select--small) {
  width: 120px;
}

:deep(.el-select.el-select--small .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-select.el-select--small .el-input__inner) {
  color: white;
  font-size: 12px;
}

/* 录制按钮特殊样式 */
.record-button {
  position: relative;
}

.record-button.is-danger::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;
  right: 0;
  top: 0;
  animation: blink 1s infinite;
}

.recording-indicator {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #ff4949;
  margin-top: 2px;
  animation: blink 1s infinite;
}

.recording-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #ff4949;
  border-radius: 50%;
  margin-right: 4px;
}

.recording-time {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 5;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style> 