# Doc Translator

中文文档翻译

## 运行

当前使用了火山引擎的模型服务，需要申请 API_KEY，然后设置环境变量：

```bash
export ARK_API_KEY='...'
```

```powershell
$Env:ARK_API_KEY='..."
```

运行如下命令:

```bash
cjpm run --skip-build \
  --name magic.examples.doc_translator \
  --run-args \
  "--source ./docs/tutorial.md --target ./docs/tutorial-en.md"
```
