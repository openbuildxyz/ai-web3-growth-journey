# AI 对话记录

## 2025-01 批量重命名 MDX 文件

**日期**: 2025-01

**用户需求**: 帮我把 content 文件夹下所有的 xx.mdx 文件重命名为 xx.zh.mdx

**AI 解决方案**:
1. 使用 `find content -name "*.mdx" -type f` 命令查找所有 .mdx 文件
2. 使用 bash 脚本批量重命名文件：
   ```bash
   find content -name "*.mdx" -type f | while read file; do
     dir=$(dirname "$file")
     basename=$(basename "$file" .mdx)
     mv "$file" "$dir/$basename.zh.mdx"
     echo "Renamed: $file -> $dir/$basename.zh.mdx"
   done
   ```

**执行结果**:
- 成功重命名 51 个 .mdx 文件为 .zh.mdx 格式
- 所有文件路径保持不变，仅扩展名从 .mdx 变更为 .zh.mdx
- Git 状态显示原文件删除，新文件为未跟踪状态

**技术要点**:
- 使用 find 命令定位文件
- bash 脚本处理文件名解析和重命名
- dirname 和 basename 命令处理路径和文件名

**项目目的**: 为国际化系统准备中文内容文件，与项目的多语言支持结构保持一致 