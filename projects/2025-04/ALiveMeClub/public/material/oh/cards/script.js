// 获取HTML元素
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const baseImageInput = document.getElementById("baseImage");
const overlayImageInput = document.getElementById("overlayImage");

const xPosInput = document.getElementById("xPos");
const yPosInput = document.getElementById("yPos");
const scaleInput = document.getElementById("scale");

let baseImage = new Image();
let overlayImage = new Image();

let baseScale = 1;
let xOffset = 0;
let yOffset = 0;

// 上传图片时实时预览
baseImageInput.addEventListener('change', loadImagesAndText);
overlayImageInput.addEventListener('change', loadImagesAndText);

// 更新底图缩放和位置
xPosInput.addEventListener('input', function() {
    xOffset = parseInt(this.value);
    loadImagesAndText();
});

yPosInput.addEventListener('input', function() {
    yOffset = parseInt(this.value);
    loadImagesAndText();
});

scaleInput.addEventListener('input', function() {
    baseScale = parseFloat(this.value);
    loadImagesAndText();
});

// 动态添加文字单位
function addTextUnit() {
    const textUnitContainer = document.getElementById('textInputs');
    const textUnit = document.createElement('div');
    textUnit.classList.add('textUnit');

    textUnit.innerHTML = `
        <input type="text" class="textInput" placeholder="输入文字">
        <input type="color" class="textColor" value="#FFFFFF">
        <input type="number" class="textSize" placeholder="字体大小" value="30">
        <input type="number" class="textAngle" placeholder="旋转角度" value="0">
        <label for="font">字体:</label>
        <select class="fontFamily">
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
        </select>
        <label for="xPosText">X 轴:</label>
        <input type="range" class="xPosText" min="0" max="500" value="150">
        <label for="yPosText">Y 轴:</label>
        <input type="range" class="yPosText" min="0" max="500" value="150">
        <button onclick="removeTextUnit(this)">删除</button>
    `;

    textUnitContainer.appendChild(textUnit);

    // 为所有控件添加事件监听器，实时更新预览
    textUnit.querySelector('.xPosText').addEventListener('input', loadImagesAndText);
    textUnit.querySelector('.yPosText').addEventListener('input', loadImagesAndText);
    textUnit.querySelector('.textInput').addEventListener('input', loadImagesAndText);
    textUnit.querySelector('.textColor').addEventListener('input', loadImagesAndText);
    textUnit.querySelector('.textSize').addEventListener('input', loadImagesAndText);
    textUnit.querySelector('.textAngle').addEventListener('input', loadImagesAndText);
    textUnit.querySelector('.fontFamily').addEventListener('change', loadImagesAndText);  // 字体选择器事件
}

// 删除某个文字单位
function removeTextUnit(button) {
    const textUnit = button.parentElement;
    textUnit.remove();
    loadImagesAndText(); // 重新生成预览图
}

// 实时加载图片和文字
function loadImagesAndText() {
    const baseFile = baseImageInput.files[0];
    const overlayFile = overlayImageInput.files[0];

    if (!baseFile && !overlayFile) {
        alert("请至少上传一张图片");
        return;
    }

    // 加载覆盖图
    if (overlayFile) {
        const overlayReader = new FileReader();
        overlayReader.onload = function (event) {
            overlayImage.src = event.target.result;

            overlayImage.onload = function () {
                // 加载底图
                if (baseFile) {
                    const baseReader = new FileReader();
                    baseReader.onload = function (event) {
                        baseImage.src = event.target.result;

                        baseImage.onload = function () {
                            // 如果两张图片都上传，按顺序绘制
                            renderImagesAndText();
                        };
                    };
                    baseReader.readAsDataURL(baseFile);
                } else {
                    // 只显示覆盖图
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.width = overlayImage.width;
                    canvas.height = overlayImage.height;
                    ctx.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);
                }
            };
        };
        overlayReader.readAsDataURL(overlayFile);
    } else if (baseFile) {
        // 加载并显示底图
        const baseReader = new FileReader();
        baseReader.onload = function (event) {
            baseImage.src = event.target.result;

            baseImage.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = baseImage.width;
                canvas.height = baseImage.height;
                ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);
            };
        };
        baseReader.readAsDataURL(baseFile);
    }
}

// 渲染图片和文字
function renderImagesAndText() {
    canvas.width = overlayImage.width;
    canvas.height = overlayImage.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清空画布

    // 绘制底图
    const scaledWidth = baseImage.width * baseScale;
    const scaledHeight = baseImage.height * baseScale;
    ctx.drawImage(baseImage, xOffset, yOffset, scaledWidth, scaledHeight);

    // 绘制覆盖图
    ctx.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);

    // 绘制每个文字单位
    const textUnits = document.querySelectorAll('.textUnit');
    textUnits.forEach(function(unit) {
        const text = unit.querySelector('.textInput').value;
        const color = unit.querySelector('.textColor').value;
        const size = unit.querySelector('.textSize').value;
        const angle = unit.querySelector('.textAngle').value;
        const fontFamily = unit.querySelector('.fontFamily').value;  // 获取字体
        const xPos = unit.querySelector('.xPosText').value;
        const yPos = unit.querySelector('.yPosText').value;

        // 设置文字属性
        ctx.save();
        ctx.translate(parseInt(xPos), parseInt(yPos));  // 根据滑动条设置文字位置
        ctx.rotate(angle * Math.PI / 180);  // 旋转角度
        ctx.font = `${size}px ${fontFamily}`;  // 使用选中的字体
        ctx.fillStyle = color;

        // 绘制文字
        ctx.fillText(text, 0, 0);
        ctx.restore();
    });
}

// 下载生成的图片
function downloadImage() {
    const link = document.createElement('a');
    link.download = 'merged_image.png';
    link.href = canvas.toDataURL();
    link.click();
}
