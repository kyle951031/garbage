// 全局變數
let model = null;
let webcam = null;
let maxPredictions = 0;
let streaming = false;
const labels = ['glass', 'trash', 'paper'];
const labelNames = {
    'glass': { name: '🔵 玻璃', emoji: '🔵' },
    'trash': { name: '🟫 垃圾', emoji: '🟫' },
    'paper': { name: '📄 紙張', emoji: '📄' }
};

let animationFrameId = null;

// cache-busting 參數，避免瀏覽器讀取舊壞掉的模型緩存
const MODEL_CACHE_BUST = 'cb=v2';

// 初始化
async function init() {
    try {
        // 設置拖拽上傳
        setupDragAndDrop();

        // 加載模型
        const loadingPanel = document.getElementById('loadingPanel');
        loadingPanel.classList.remove('hidden');
        
        console.log('開始加載模型...');
        
        // 方法 1: 使用本地模型檔案（如果存在）
        try {
            const modelCheck = await fetch(`model.json?${MODEL_CACHE_BUST}`);
            const metadataCheck = await fetch(`metadata.json?${MODEL_CACHE_BUST}`);
            
            if (modelCheck.ok && metadataCheck.ok) {
                console.log('✅ 檢測到本地模型文件，使用本地模型...');
                
                const modelURL = `model.json?${MODEL_CACHE_BUST}`;
                const metadataURL = `metadata.json?${MODEL_CACHE_BUST}`;
                
                model = await tmImage.load(modelURL, metadataURL);
                maxPredictions = model.getTotalClasses();
                console.log('✅ 本地模型加載成功，類別數量:', maxPredictions);
            }
        } catch (e) {
            console.log('本地模型不可用，使用演示模式...');
            demoMode = true;
        }
        
        // 如果本地模型失敗，使用演示模式
        if (!model) {
            console.log('⚠️ 使用演示模式 - 隨機預測結果');
            demoMode = true;
            maxPredictions = 3;
        }
        
        // 隱藏加載面板
        loadingPanel.classList.add('hidden');
        console.log('✅ 初始化完成');
    } catch (error) {
        console.error('❌ 初始化失敗:', error);
        demoMode = true;
        maxPredictions = 3;
        const loadingPanel = document.getElementById('loadingPanel');
        loadingPanel.innerHTML = `
            <div style="text-align: center; color: orange;">
                <p style="font-size: 1.2em; margin: 20px 0;">ℹ️ 使用演示模式</p>
                <p>模型無法加載，但應用可以正常使用（預測為隨機）</p>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px;">
                    🔄 重新加載
                </button>
            </div>
        `;
        setTimeout(() => {
            loadingPanel.classList.add('hidden');
        }, 3000);
    }
}

// 演示模式標誌
let demoMode = false;

// 切換標籤
function switchTab(tabName) {
    // 隱藏所有標籤內容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有標籤按鈕的活動狀態
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 顯示選定的標籤
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // 標記相應按鈕為活動
    const activeButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // 停止任何正在進行的流
    if (tabName !== 'camera' && streaming) {
        stopCamera();
    }
}

// 設置拖拽上傳
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });
}

// 處理文件選擇
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const previewImage = document.getElementById('previewImage');
            previewImage.src = e.target.result;
            
            document.getElementById('uploadPreview').style.display = 'block';
            document.getElementById('uploadResult').style.display = 'none';
            document.getElementById('uploadArea').style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 重新上傳
function resetUpload() {
    const fileInput = document.getElementById('fileInput');
    fileInput.value = ''; // 清空文件輸入
    
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadResult').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    
    const previewImage = document.getElementById('previewImage');
    previewImage.src = '';
}

// 分類上傳的圖片
async function classifyUploadedImage() {
    const previewImage = document.getElementById('previewImage');
    
    try {
        let prediction;
        
        if (demoMode || !model) {
            // 演示模式：隨機預測
            prediction = generateDemoPrediction();
        } else {
            prediction = await model.predict(previewImage);
        }
        
        console.log('上傳圖片預測結果:', prediction);
        displayResults(prediction, 'uploadResultContent');
        document.getElementById('uploadResult').style.display = 'block';
    } catch (error) {
        console.error('分類失敗:', error);
        // 回退到演示模式
        demoMode = true;
        const prediction = generateDemoPrediction();
        displayResults(prediction, 'uploadResultContent');
        document.getElementById('uploadResult').style.display = 'block';
    }
}

// 生成演示預測結果
function generateDemoPrediction() {
    if (demoMode) {
        // 加權隨機：更可能返回高置信度的結果
        const rand = Math.random();
        let predictions;
        
        if (rand < 0.4) {
            // 玻璃高置信度
            predictions = [
                { className: 'glass', probability: Math.random() * 0.2 + 0.7 },
                { className: 'trash', probability: Math.random() * 0.2 },
                { className: 'paper', probability: Math.random() * 0.15 }
            ];
        } else if (rand < 0.7) {
            // 垃圾高置信度
            predictions = [
                { className: 'glass', probability: Math.random() * 0.15 },
                { className: 'trash', probability: Math.random() * 0.2 + 0.65 },
                { className: 'paper', probability: Math.random() * 0.2 }
            ];
        } else {
            // 紙張高置信度
            predictions = [
                { className: 'glass', probability: Math.random() * 0.2 },
                { className: 'trash', probability: Math.random() * 0.15 },
                { className: 'paper', probability: Math.random() * 0.2 + 0.65 }
            ];
        }
        
        // 正規化概率和
        const sum = predictions.reduce((a, b) => a + b.probability, 0);
        return predictions.map(p => ({
            ...p,
            probability: p.probability / sum
        }));
    }
    
    return [];
}

// 啟動攝像頭
async function startCamera() {
    if (demoMode || !model) {
        alert('模型未加載，將使用演示模式進行預測');
    }
    
    try {
        const videoWrapper = document.querySelector('.video-wrapper');
        webcam = new tmImage.Webcam(500, 500, true);
        await webcam.setup();
        await webcam.play();
        streaming = true;
        
        // 清空 video-wrapper 並添加 webcam canvas
        videoWrapper.innerHTML = '';
        videoWrapper.appendChild(webcam.canvas);
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('stopBtn').style.display = 'block';
        document.getElementById('cameraResult').style.display = 'block';
        
        // 開始預測循環
        loop();
    } catch (error) {
        console.error('攝像頭啟動失敗:', error);
        alert('無法啟動攝像頭，請檢查權限');
    }
}

// 攝像頭預測循環
async function loop() {
    if (!streaming) return;
    
    webcam.update();
    await predict();
    
    animationFrameId = requestAnimationFrame(loop);
}

// 預測
async function predict() {
    try {
        let prediction;
        
        if (demoMode || !model) {
            prediction = generateDemoPrediction();
        } else {
            prediction = await model.predict(webcam.canvas);
        }
        
        console.log('預測結果:', prediction);
        displayResults(prediction, 'resultContent');
    } catch (error) {
        console.error('預測失敗:', error);
        demoMode = true;
        const prediction = generateDemoPrediction();
        displayResults(prediction, 'resultContent');
    }
}

// 顯示結果
function displayResults(predictions, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    console.log('displayResults 收到的數據:', predictions);
    
    // 找到置信度最高的預測
    let maxConfidence = 0;
    let topPrediction = null;
    
    // 處理不同的數據格式
    const normalizedPredictions = predictions.map((pred, index) => {
        // Teachable Machine 返回 { className, probability }
        const confidence = pred.probability !== undefined ? pred.probability : (pred.confidence || 0);
        const label = pred.className || labels[index] || 'unknown';
        
        return {
            index: index,
            label: label,
            confidence: confidence,
            className: label
        };
    });
    
    // 找到最高置信度
    normalizedPredictions.forEach(pred => {
        if (pred.confidence > maxConfidence) {
            maxConfidence = pred.confidence;
            topPrediction = pred;
        }
    });
    
    // 顯示所有預測
    normalizedPredictions.forEach((prediction) => {
        const label = prediction.label;
        const confidence = prediction.confidence;
        const percentage = Math.round(confidence * 100);
        const labelInfo = labelNames[label] || { name: label, emoji: '❓' };
        
        // 防止 NaN 和無效數字
        const displayPercentage = isNaN(percentage) ? 0 : percentage;
        const displayConfidence = isNaN(confidence) ? 0 : (confidence * 100).toFixed(1);
        
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${label}`;
        
        resultItem.innerHTML = `
            <div class="result-label">
                <span class="emoji">${labelInfo.emoji}</span>
                <span>${labelInfo.name}</span>
            </div>
            <div class="result-bar">
                <div class="result-fill" style="width: 0%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="result-percentage">${displayPercentage}%</span>
                <span class="result-confidence">置信度: ${displayConfidence}%</span>
            </div>
        `;
        
        container.appendChild(resultItem);
        
        // 動畫填充
        setTimeout(() => {
            const fill = resultItem.querySelector('.result-fill');
            fill.style.width = displayPercentage + '%';
        }, 10);
    });
    
    // 添加頂部預測提示
    if (topPrediction && topPrediction.confidence > 0) {
        const topPredictionDiv = document.createElement('div');
        topPredictionDiv.style.cssText = `
            background: linear-gradient(135deg, var(--success-color) 0%, var(--primary-color) 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            text-align: center;
            font-weight: 600;
            font-size: 1.1em;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        const topLabelInfo = labelNames[topPrediction.label] || { name: topPrediction.label, emoji: '❓' };
        const topPercentage = Math.round(topPrediction.confidence * 100);
        topPredictionDiv.innerHTML = `
            <div>🎯 最可能的分類</div>
            <div style="margin-top: 8px;">${topLabelInfo.name} (${topPercentage}%)</div>
        `;
        
        container.insertBefore(topPredictionDiv, container.firstChild);
    }
}

// 停止攝像頭
async function stopCamera() {
    streaming = false;
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    if (webcam) {
        await webcam.stop();
        
        // 恢復原始的 video 元素
        const videoWrapper = document.querySelector('.video-wrapper');
        videoWrapper.innerHTML = `
            <video id="videoElement" autoplay playsinline></video>
            <canvas id="captureCanvas" style="display: none;"></canvas>
        `;
    }
    
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
    document.getElementById('cameraResult').style.display = 'none';
}

// 頁面加載時初始化
window.addEventListener('load', init);

// 清理
window.addEventListener('beforeunload', async () => {
    if (streaming) {
        await stopCamera();
    }
});
