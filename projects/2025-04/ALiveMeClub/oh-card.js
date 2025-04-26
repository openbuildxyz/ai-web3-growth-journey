document.addEventListener('DOMContentLoaded', function() {
    // 预加载卡背图片
    const preloadBackImg = new Image();
    preloadBackImg.onload = function() {
        console.log("卡背图片预加载成功");
        // 保存图片对象以便后续使用
        window.preloadedBackImg = preloadBackImg;
    };
    preloadBackImg.onerror = function() {
        console.error("卡背图片预加载失败");
    };

    // 尝试多种路径
    const baseUrl = window.location.origin;
    const backImgPath = "/public/material/oh/cards/back.png";
    preloadBackImg.src = baseUrl + backImgPath;
    // Elements
    const steps = document.querySelectorAll('.oh-card-step');
    const readyBtn = document.getElementById('ready-btn');
    const drawCardBtn = document.getElementById('draw-card-btn');
    const cardImage = document.getElementById('card-image');
    const cardInner = document.querySelector('.card-inner');
    const questionContainer = document.getElementById('question-container');
    const questionOptions = document.getElementById('question-options');
    const cardQuestions = document.getElementById('card-questions');
    const cardQuestionsPreview = document.getElementById('card-questions-preview');
    const cardBackPreview = document.getElementById('card-back-preview');
    const redrawBtn = document.getElementById('redraw-btn');
    const confirmationModal = document.getElementById('confirmation-modal');
    const cancelRedrawBtn = document.getElementById('cancel-redraw');
    const confirmRedrawBtn = document.getElementById('confirm-redraw');
    const finalStep = document.getElementById('final-step');
    const saveCardBtn = document.getElementById('save-card-btn');
    const restartBtn = document.getElementById('restart-btn');
    const startExperienceBtn = document.getElementById('start-experience-btn');

    // Image Preview Modal Elements
    const imagePreviewModal = document.getElementById('image-preview-modal');
    const previewCardImage = document.getElementById('preview-card-image');
    const previewCardQuestions = document.getElementById('preview-card-questions');
    const closePreviewBtn = document.getElementById('close-preview');

    // Variables
    let currentStep = 1;
    let currentRound = 0;
    let selectedQuestions = [];
    let currentCardNumber = null;
    let hasAnsweredQuestion = false; // 用于跟踪用户是否已经回答了问题

    // Question pools
    const questionPools = [
        [
            "看到了什么？感受如何？",
            "抽到的卡牌与你最近发生的事或感受相关吗？",
            "你说卡牌中的两个主角，他们是什么关系？"
        ],
        [
            "我很好奇，你为什么会这样描述它？",
            "你注意到的这个细节，你觉得它是什么？从哪里来的？",
            "你觉得这个人在做什么？ta做这件事有什么感受？"
        ],
        [
            "卡中人物处在什么环境中？环境对ta有什么影响？",
            "你在这个卡牌中吗？你是里面的谁？在做什么？感受如何？",
            "你的故事里，主角遭遇的事情，ta可以怎么解决？"
        ]
    ];

    // Event Listeners
    readyBtn.addEventListener('click', goToStep2);
    drawCardBtn.addEventListener('click', drawCard);
    redrawBtn.addEventListener('click', showRedrawConfirmation);
    cancelRedrawBtn.addEventListener('click', hideRedrawConfirmation);
    confirmRedrawBtn.addEventListener('click', redrawCard);
    saveCardBtn.addEventListener('click', saveCard);
    restartBtn.addEventListener('click', restartGame);

    // Image Preview Event Listeners
    if (cardInner) {
        cardInner.addEventListener('click', function() {
            if (selectedQuestions.length === 3) {
                showImagePreview();
            }
        });
    }

    if (cardBackPreview) {
        cardBackPreview.addEventListener('click', showImagePreview);
    }

    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', hideImagePreview);
    }

    // Functions
    function goToStep2() {
        showStep(2);
    }

    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        currentStep = stepNumber;
    }

    function drawCard() {
        showStep(3);

        // Generate random card number between 11 and 19
        currentCardNumber = Math.floor(Math.random() * 9) + 11; // 从11到19之间随机选择

        // Show card back first
        cardImage.src = "../public/material/oh/cards/back.png";

        // Add drawn animation
        cardInner.classList.add('card-drawn');

        // 预加载实际卡片图片
        const preloadImage = new Image();
        preloadImage.onload = function() {
            // After a short delay, show the actual card
            setTimeout(() => {
                cardImage.src = preloadImage.src;

                // Show first round of questions
                showQuestionOptions(0);
            }, 1000);
        };

        // 设置预加载图片的源
        preloadImage.src = `../public/material/oh/cards/${currentCardNumber}.png`;
        console.log(`抽取卡片: ${currentCardNumber}.png`); // 添加日志以便调试

        // 如果图片已经缓存，onload 可能不会触发
        if (preloadImage.complete) {
            setTimeout(() => {
                cardImage.src = preloadImage.src;

                // Show first round of questions
                showQuestionOptions(0);
            }, 1000);
        }
    }

    function showQuestionOptions(roundIndex) {
        currentRound = roundIndex;

        // Clear previous options
        questionOptions.innerHTML = '';

        // Add new options
        questionPools[roundIndex].forEach((question, index) => {
            const option = document.createElement('div');
            option.className = 'question-option';
            option.textContent = question;
            option.dataset.index = index;
            option.addEventListener('click', () => selectQuestionOption(question));
            questionOptions.appendChild(option);
        });
    }

    function selectQuestionOption(question) {
        // 第一次回答问题时，标记为已开始回答
        if (selectedQuestions.length === 0) {
            hasAnsweredQuestion = true;
            // 隐藏重抽按钮，因为已经开始回答问题
            redrawBtn.style.display = 'none';
        }

        // Add selected question to array
        selectedQuestions.push(question);

        // Highlight selected option
        const options = questionOptions.querySelectorAll('.question-option');
        options.forEach(opt => {
            if (opt.textContent === question) {
                opt.classList.add('selected');
            }
        });

        // Move to next round or finish
        setTimeout(() => {
            if (currentRound < 2) {
                showQuestionOptions(currentRound + 1);
            } else {
                finishCardReading();
            }
        }, 500);
    }

    function finishCardReading() {
        // Hide question container
        questionContainer.style.display = 'none';

        // Show final step
        finalStep.classList.remove('hidden');

        // 使用Canvas将问题绘制到卡背图片上
        createCardBackWithQuestions(function(cardBackWithQuestionsUrl) {
            // 更新卡背图片
            const cardBackImg = document.createElement('img');
            cardBackImg.src = cardBackWithQuestionsUrl;
            cardBackImg.className = 'w-full h-full';
            cardBackImg.alt = 'OH卡背面';

            // 更新卡背预览图片
            const cardBackPreviewImg = document.createElement('img');
            cardBackPreviewImg.src = cardBackWithQuestionsUrl;
            cardBackPreviewImg.className = 'w-full h-full';
            cardBackPreviewImg.alt = 'OH卡背面预览';

            // 清空并添加新的卡背图片
            cardQuestions.innerHTML = '';
            cardQuestions.appendChild(cardBackImg);

            cardQuestionsPreview.innerHTML = '';
            cardQuestionsPreview.appendChild(cardBackPreviewImg);

            // 保存卡背图片URL，以便后续使用
            window.cardBackWithQuestionsUrl = cardBackWithQuestionsUrl;

            // Show card back preview
            cardBackPreview.classList.remove('hidden');

            // Flip card to show back
            setTimeout(() => {
                cardInner.classList.add('flipped');
            }, 500);
        });
    }

    // 创建带有问题的卡背图片
    function createCardBackWithQuestions(callback) {
        // 创建Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置Canvas尺寸 - 使用标准卡片尺寸比例
        canvas.width = 600;
        canvas.height = 900;

        // 加载卡背图片
        let backImg;

        // 定义处理背景图片的函数
        function processBackImage() {
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制纯色背景，确保没有透明区域
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 绘制卡背图片，确保填满整个画布
            const scale = Math.max(canvas.width / backImg.width, canvas.height / backImg.height);
            const scaledWidth = backImg.width * scale;
            const scaledHeight = backImg.height * scale;

            // 居中绘制卡背图片
            const xOffset = (canvas.width - scaledWidth) / 2;
            const yOffset = (canvas.height - scaledHeight) / 2;

            // 绘制卡背图片
            ctx.drawImage(backImg, xOffset, yOffset, scaledWidth, scaledHeight);

            // 添加半透明黑色遮罩，使文字更加清晰可见
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 继续处理文字部分
            drawQuestionsOnCanvas();
        }

        // 如果有预加载的图片，直接使用
        if (window.preloadedBackImg && window.preloadedBackImg.complete) {
            console.log("使用预加载的卡背图片");
            backImg = window.preloadedBackImg;
            // 直接处理图片
            processBackImage();
        } else {
            // 否则创建新的图片对象
            console.log("创建新的卡背图片对象");
            backImg = new Image();
            backImg.crossOrigin = "Anonymous"; // 允许跨域图片处理
            backImg.onload = processBackImage;

            // 设置图片源 - 尝试使用绝对路径
            const baseUrl = window.location.origin;
            const backImgPath = "/public/material/oh/cards/back.png";
            backImg.src = baseUrl + backImgPath;

            // 处理图片加载错误
            backImg.onerror = function() {
                console.error("卡背图片加载失败");
                // 创建一个备用的纯色背景
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 继续处理文字
                drawQuestionsOnCanvas();
            };
        }

        // 抽取绘制问题的函数，以便在图片加载失败时也能使用
        function drawQuestionsOnCanvas() {
            // 设置文字样式
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';

            // 添加文字阴影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // 添加标题
            ctx.font = 'bold 36px Arial';
            ctx.fillText('我的OH卡问题', canvas.width / 2, 150);

            // 绘制问题文字
            selectedQuestions.forEach((question, index) => {
                // 根据问题长度动态调整字体大小
                const fontSize = question.length > 30 ? 24 : 28;
                ctx.font = `${fontSize}px Arial`;

                // 分割长文本为多行
                const maxWidth = canvas.width - 100; // 留出左右边距
                const words = question.split('');
                let line = '';
                let lines = [];

                // 中文文本分行处理
                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i];
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;

                    if (testWidth > maxWidth && line !== '') {
                        lines.push(line);
                        line = words[i];
                    } else {
                        line = testLine;
                    }
                }

                if (line !== '') {
                    lines.push(line);
                }

                // 计算文本块的起始Y坐标
                const lineHeight = fontSize * 1.5;
                const totalTextHeight = lines.length * lineHeight;
                let startY = 250 + index * (totalTextHeight + 50); // 50是问题之间的间距

                // 绘制问题序号
                ctx.font = 'bold 32px Arial';
                ctx.fillText(`问题 ${index + 1}:`, canvas.width / 2, startY);
                startY += 40; // 问题序号与内容的间距

                // 恢复问题字体
                ctx.font = `${fontSize}px Arial`;

                // 绘制每一行
                lines.forEach((l, i) => {
                    ctx.fillText(l, canvas.width / 2, startY + i * lineHeight);
                });
            });

            // 清除阴影效果
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 添加水印
            ctx.font = '18px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText('ALiveMe OH卡', canvas.width / 2, canvas.height - 30);

            // 将Canvas转换为图片URL
            const cardBackWithQuestionsUrl = canvas.toDataURL('image/png');

            // 回调函数返回图片URL
            callback(cardBackWithQuestionsUrl);
        }

        // 抽取绘制问题的函数，以便在图片加载失败时也能使用
        function drawQuestionsOnCanvas() {
            // 设置文字样式
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';

            // 添加文字阴影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // 添加标题
            ctx.font = 'bold 36px Arial';
            ctx.fillText('我的OH卡问题', canvas.width / 2, 150);

            // 绘制问题文字
            selectedQuestions.forEach((question, index) => {
                // 根据问题长度动态调整字体大小
                const fontSize = question.length > 30 ? 24 : 28;
                ctx.font = `${fontSize}px Arial`;

                // 分割长文本为多行
                const maxWidth = canvas.width - 100; // 留出左右边距
                const words = question.split('');
                let line = '';
                let lines = [];

                // 中文文本分行处理
                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i];
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;

                    if (testWidth > maxWidth && line !== '') {
                        lines.push(line);
                        line = words[i];
                    } else {
                        line = testLine;
                    }
                }

                if (line !== '') {
                    lines.push(line);
                }

                // 计算文本块的起始Y坐标
                const lineHeight = fontSize * 1.5;
                const totalTextHeight = lines.length * lineHeight;
                let startY = 250 + index * (totalTextHeight + 50); // 50是问题之间的间距

                // 绘制问题序号
                ctx.font = 'bold 32px Arial';
                ctx.fillText(`问题 ${index + 1}:`, canvas.width / 2, startY);
                startY += 40; // 问题序号与内容的间距

                // 恢复问题字体
                ctx.font = `${fontSize}px Arial`;

                // 绘制每一行
                lines.forEach((l, i) => {
                    ctx.fillText(l, canvas.width / 2, startY + i * lineHeight);
                });
            });

            // 清除阴影效果
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 添加水印
            ctx.font = '18px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText('ALiveMe OH卡', canvas.width / 2, canvas.height - 30);

            // 将Canvas转换为图片URL
            const cardBackWithQuestionsUrl = canvas.toDataURL('image/png');

            // 回调函数返回图片URL
            callback(cardBackWithQuestionsUrl);
        }
    }

    function showImagePreview() {
        if (selectedQuestions.length === 3 && imagePreviewModal) {
            // Set preview image for front card
            previewCardImage.src = cardImage.src;

            // 使用已生成的卡背图片
            if (window.cardBackWithQuestionsUrl) {
                // 创建卡背预览图片
                const cardBackPreviewImg = document.createElement('img');
                cardBackPreviewImg.src = window.cardBackWithQuestionsUrl;
                cardBackPreviewImg.className = 'w-full h-full';
                cardBackPreviewImg.alt = 'OH卡背面预览';

                // 清空并添加新的卡背图片
                previewCardQuestions.innerHTML = '';
                previewCardQuestions.appendChild(cardBackPreviewImg);
            } else {
                // 如果还没有生成卡背图片，则创建一个新的
                createCardBackWithQuestions(function(cardBackWithQuestionsUrl) {
                    // 创建卡背预览图片
                    const cardBackPreviewImg = document.createElement('img');
                    cardBackPreviewImg.src = cardBackWithQuestionsUrl;
                    cardBackPreviewImg.className = 'w-full h-full';
                    cardBackPreviewImg.alt = 'OH卡背面预览';

                    // 清空并添加新的卡背图片
                    previewCardQuestions.innerHTML = '';
                    previewCardQuestions.appendChild(cardBackPreviewImg);

                    // 保存卡背图片URL，以便后续使用
                    window.cardBackWithQuestionsUrl = cardBackWithQuestionsUrl;
                });
            }

            // 确保图片加载完成后再显示模态框
            previewCardImage.onload = function() {
                // Show modal
                imagePreviewModal.classList.remove('hidden');
            };

            // 如果图片已经缓存，onload 可能不会触发，所以也要直接显示
            if (previewCardImage.complete) {
                // Show modal
                imagePreviewModal.classList.remove('hidden');
            }
        }
    }

    function hideImagePreview() {
        if (imagePreviewModal) {
            imagePreviewModal.classList.add('hidden');
        }
    }

    function showRedrawConfirmation() {
        // 如果用户已经回答了问题，则不允许重抽
        if (hasAnsweredQuestion) {
            alert('已经开始回答问题了，不能再重抽了。');
            return;
        }

        confirmationModal.classList.remove('hidden');
    }

    function hideRedrawConfirmation() {
        confirmationModal.classList.add('hidden');
    }

    function redrawCard() {
        hideRedrawConfirmation();

        // Reset selected questions
        selectedQuestions = [];

        // Reset card flip
        cardInner.classList.remove('flipped');

        // Show question container again
        questionContainer.style.display = 'block';

        // Hide final step
        finalStep.classList.add('hidden');

        // Hide card back preview
        if (cardBackPreview) {
            cardBackPreview.classList.add('hidden');
        }

        // 不需要隐藏重抽按钮，允许无限重抽

        // Draw a new card (从11到19之间)
        let newCardNumber;
        do {
            newCardNumber = Math.floor(Math.random() * 9) + 11; // 从11到19之间随机选择
        } while (newCardNumber === currentCardNumber);

        currentCardNumber = newCardNumber;
        console.log(`重抽卡片: ${currentCardNumber}.png`); // 添加日志以便调试

        // Show card back first
        cardImage.src = "../public/material/oh/cards/back.png";

        // Add drawn animation
        cardInner.classList.remove('card-drawn');
        void cardInner.offsetWidth; // Trigger reflow
        cardInner.classList.add('card-drawn');

        // 预加载实际卡片图片
        const preloadImage = new Image();
        preloadImage.onload = function() {
            // After a short delay, show the actual card
            setTimeout(() => {
                cardImage.src = preloadImage.src;

                // Show first round of questions
                showQuestionOptions(0);
            }, 1000);
        };

        // 设置预加载图片的源
        preloadImage.src = `../public/material/oh/cards/${currentCardNumber}.png`;

        // 如果图片已经缓存，onload 可能不会触发
        if (preloadImage.complete) {
            setTimeout(() => {
                cardImage.src = preloadImage.src;

                // Show first round of questions
                showQuestionOptions(0);
            }, 1000);
        }
    }

    function saveCard() {
        // 如果还没有生成卡背图片，先生成一个
        if (!window.cardBackWithQuestionsUrl) {
            createCardBackWithQuestions(function(cardBackWithQuestionsUrl) {
                window.cardBackWithQuestionsUrl = cardBackWithQuestionsUrl;
                saveCardImages();
            });
        } else {
            saveCardImages();
        }
    }

    function saveCardImages() {
        // Create a canvas to combine front and back of card side by side
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 获取原始图片尺寸，以便保持比例
        const frontImgTemp = new Image();
        frontImgTemp.src = cardImage.src;

        // 计算合适的画布尺寸和图片布局
        const calculateDimensions = () => {
            // 假设卡片是标准的3:2比例
            const cardRatio = 3/2;

            // 设置画布宽度，高度根据卡片比例计算
            const canvasWidth = 1200;
            const cardWidth = canvasWidth / 2;
            const cardHeight = cardWidth * cardRatio;

            return {
                canvasWidth: canvasWidth,
                canvasHeight: cardHeight,
                cardWidth: cardWidth,
                cardHeight: cardHeight
            };
        };

        const dimensions = calculateDimensions();

        // 设置画布尺寸
        canvas.width = dimensions.canvasWidth;
        canvas.height = dimensions.canvasHeight;

        // 创建背景
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加标题和说明
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('我的OH卡', canvas.width / 2, 40);

        // 创建卡片容器的阴影效果
        function drawCardContainer(x, y, width, height, title) {
            // 绘制阴影
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            // 绘制卡片容器背景
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, width, height);

            // 清除阴影效果
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 添加标题
            ctx.fillStyle = '#333';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(title, x + width / 2, y - 10);
        }

        // 创建新图片对象
        const frontImg = new Image();
        const backImg = new Image();

        // 当两张图片都加载完成后再绘制
        let loadedImages = 0;
        const totalImages = 2;

        // 在图片加载完成后，绘制图片
        function imageLoaded() {
            loadedImages++;
            if (loadedImages === totalImages) {
                // 计算边距和卡片尺寸
                const margin = 50;
                const cardContainerWidth = (canvas.width - margin * 3) / 2;
                const cardContainerHeight = canvas.height - margin * 2;

                // 绘制卡片容器
                drawCardContainer(margin, margin, cardContainerWidth, cardContainerHeight, "正面");
                drawCardContainer(margin * 2 + cardContainerWidth, margin, cardContainerWidth, cardContainerHeight, "背面");

                // 计算图片绘制尺寸，保持原始比例
                function calculateImageDimensions(img, containerWidth, containerHeight) {
                    const imgRatio = img.width / img.height;
                    const containerRatio = containerWidth / containerHeight;

                    let drawWidth, drawHeight;

                    if (imgRatio > containerRatio) {
                        // 图片更宽，以宽度为基准
                        drawWidth = containerWidth;
                        drawHeight = drawWidth / imgRatio;
                    } else {
                        // 图片更高，以高度为基准
                        drawHeight = containerHeight;
                        drawWidth = drawHeight * imgRatio;
                    }

                    // 计算居中位置
                    const x = (containerWidth - drawWidth) / 2;
                    const y = (containerHeight - drawHeight) / 2;

                    return { width: drawWidth, height: drawHeight, x: x, y: y };
                }

                // 计算前面卡片的绘制尺寸和位置
                const frontImgDim = calculateImageDimensions(
                    frontImg,
                    cardContainerWidth - 20, // 留出内边距
                    cardContainerHeight - 20
                );

                // 计算背面卡片的绘制尺寸和位置
                const backImgDim = calculateImageDimensions(
                    backImg,
                    cardContainerWidth - 20,
                    cardContainerHeight - 20
                );

                // 绘制前面的卡片
                ctx.drawImage(
                    frontImg,
                    margin + 10 + frontImgDim.x,
                    margin + 10 + frontImgDim.y,
                    frontImgDim.width,
                    frontImgDim.height
                );

                // 绘制背面的卡片
                ctx.drawImage(
                    backImg,
                    margin * 2 + cardContainerWidth + 10 + backImgDim.x,
                    margin + 10 + backImgDim.y,
                    backImgDim.width,
                    backImgDim.height
                );

                // 添加水印
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('ALiveMe OH卡 - ' + new Date().toLocaleDateString(), canvas.width / 2, canvas.height - 15);

                // Convert to data URL and trigger download
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'my-oh-card.png';
                link.href = dataUrl;
                link.click();
            }
        }

        frontImg.onload = imageLoaded;
        backImg.onload = imageLoaded;

        // 处理图片加载错误
        frontImg.onerror = function() {
            console.error("正面卡片图片加载失败");
            // 使用备用图片或显示错误信息
        };

        backImg.onerror = function() {
            console.error("背面卡片图片加载失败");
            // 使用备用图片或显示错误信息
        };

        // Load the images
        frontImg.crossOrigin = "Anonymous";
        backImg.crossOrigin = "Anonymous";

        // 加载前面的卡片
        frontImg.src = cardImage.src;

        // 加载带有问题的卡背图片
        if (window.cardBackWithQuestionsUrl) {
            console.log("使用已生成的卡背图片");
            backImg.src = window.cardBackWithQuestionsUrl;
        } else {
            console.error("卡背图片未生成，重新生成");
            // 如果卡背图片未生成，重新生成一个
            createCardBackWithQuestions(function(cardBackWithQuestionsUrl) {
                window.cardBackWithQuestionsUrl = cardBackWithQuestionsUrl;
                backImg.src = cardBackWithQuestionsUrl;
            });
        }
    }

    function restartGame() {
        // Reset everything
        currentStep = 1;
        currentRound = 0;
        selectedQuestions = [];
        currentCardNumber = null;
        hasAnsweredQuestion = false;

        // 清除已生成的卡背图片
        window.cardBackWithQuestionsUrl = null;

        // Reset UI
        cardInner.classList.remove('flipped');
        cardInner.classList.remove('card-drawn');
        questionContainer.style.display = 'block';
        finalStep.classList.add('hidden');
        redrawBtn.style.display = 'block';

        // Hide card back preview
        if (cardBackPreview) {
            cardBackPreview.classList.add('hidden');
        }

        // Go back to step 1
        showStep(1);
    }

    // Initialize
    showStep(1);
});
