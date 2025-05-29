const fs = require('fs');
const path = require('path');

// 需要处理的目录
const directories = [
  'content/docs/2025-04-projects',
  'content/docs/2025-05-projects'
];

// 微信图片域名
const wechatImagePattern = /https:\/\/mmbiz\.qpic\.cn\/[^)\s"]+/g;

// 替换函数
function replaceWechatImages(content) {
  return content.replace(wechatImagePattern, (match) => {
    const encodedUrl = encodeURIComponent(match);
    return `/api/image-proxy?url=${encodedUrl}`;
  });
}

// 处理文件
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasWechatImages = wechatImagePattern.test(content);
    
    if (hasWechatImages) {
      const newContent = replaceWechatImages(content);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ 已处理: ${filePath}`);
      
      // 重置正则表达式
      wechatImagePattern.lastIndex = 0;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 处理失败: ${filePath}`, error);
    return false;
  }
}

// 处理目录
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  目录不存在: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  let processedCount = 0;

  files.forEach(file => {
    if (file.endsWith('.mdx') || file.endsWith('.md')) {
      const filePath = path.join(dirPath, file);
      if (processFile(filePath)) {
        processedCount++;
      }
    }
  });

  console.log(`📁 ${dirPath}: 处理了 ${processedCount} 个文件`);
}

// 主函数
function main() {
  console.log('🚀 开始处理微信图片链接...\n');
  
  directories.forEach(dir => {
    processDirectory(dir);
  });
  
  console.log('\n✨ 处理完成！');
  console.log('\n📝 使用说明:');
  console.log('1. 现在所有微信图片都会通过代理API加载');
  console.log('2. 如果图片仍然不显示，请检查网络连接');
  console.log('3. 如需还原，请从git恢复文件');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { replaceWechatImages, processFile, processDirectory }; 