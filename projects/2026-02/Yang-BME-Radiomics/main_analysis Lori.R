# ==========================================
# 项目名称: RadPredict-MRI 自动化影像组学分析流水线
# 功能: 自动预处理、LASSO 特征降维、模型评估与高水准可视化
# ==========================================
# AI Agent Core Engine: Radiomics Predictor
# Function: This agent automates MRI feature extraction and malignancy prediction.
# Input: MRI Radiomics Excel file
# Output: Risk assessment and explainable feature importance
# 1. 环境准备 
library(readxl)
library(glmnet)
library(pROC)
library(ggplot2)
library(dplyr)

# --- 2. 灵活的数据加载 ---
# 优先读取当前目录下的文件，若不存在则弹出选择框
file_path <- "MRI_Whole-tumor_Radiomics.xlsx"
if (!file.exists(file_path)) {
  message("未在当前目录找到默认文件，请手动选择数据文件...")
  file_path <- file.choose()
}
df <- read_excel(file_path)

# --- 3. 数据清洗与预处理 ---
# 统一标签命名并转换为因子
colnames(df)[which(colnames(df) == "label (cs/non-cs)")] <- "label"
df$label <- as.factor(df$label)

# 移除 ID 列及非数值特征
if ("ID" %in% colnames(df)) df$ID <- NULL
X <- df[, colnames(df) != "label"] %>% select_if(is.numeric)
y <- df$label

# 过滤零方差特征 (这些特征没有预测意义)
sd_vec <- apply(X, 2, sd)
X <- X[, sd_vec > 0]

# --- 4. 数据集拆分与标准化 ---
set.seed(123)
idx <- sample(1:nrow(df), floor(0.7 * nrow(df)))
X_train_raw <- X[idx, ]; y_train <- y[idx]
X_test_raw <- X[-idx, ]; y_test <- y[-idx]

# 使用训练集的参数进行标准化，防止数据泄露 (Data Leakage)
means <- apply(X_train_raw, 2, mean)
sds <- apply(X_train_raw, 2, sd)
sds[sds == 0] <- 1

X_train <- scale(X_train_raw, center = means, scale = sds)
X_test <- scale(X_test_raw, center = means, scale = sds)

# --- 5. LASSO 模型训练 (带交叉验证) ---
# family="binomial" 对应二分类任务
cvfit <- cv.glmnet(as.matrix(X_train), as.numeric(y_train), 
                   family = "binomial", alpha = 1, nfolds = 10)

# 预测概率
pred_train <- predict(cvfit, as.matrix(X_train), s = "lambda.min", type = "response")
pred_test <- predict(cvfit, as.matrix(X_test), s = "lambda.min", type = "response")

# --- 6. 核心特征提取 (黑客松亮点：模型解释性) ---
coeffs <- coef(cvfit, s = "lambda.min")
active_features <- data.frame(
  Feature = rownames(coeffs)[coeffs[,1] != 0],
  Coefficient = coeffs[coeffs[,1] != 0, 1]
) %>% filter(Feature != "(Intercept)") %>% arrange(desc(abs(Coefficient)))

cat("\n>>> 筛选出的关键影像特征:\n")
print(active_features)

# --- 7. 高级可视化 (ggplot2 风格) ---
roc_train <- roc(as.numeric(y_train), as.vector(pred_train), quiet = TRUE)
roc_test <- roc(as.numeric(y_test), as.vector(pred_test), quiet = TRUE)

# 构建绘图数据
df_roc_train <- data.frame(
  fpr = 1 - roc_train$specificities,
  tpr = roc_train$sensitivities,
  Dataset = paste0("Training (AUC = ", round(auc(roc_train), 3), ")")
)
df_roc_test <- data.frame(
  fpr = 1 - roc_test$specificities,
  tpr = roc_test$sensitivities,
  Dataset = paste0("Validation (AUC = ", round(auc(roc_test), 3), ")")
)
df_plot <- rbind(df_roc_train, df_roc_test)

# 绘制ROC 曲线
p <- ggplot(df_plot, aes(x = fpr, y = tpr, color = Dataset)) +
  geom_path(size = 1.2) +
  geom_abline(intercept = 0, slope = 1, linetype = "dashed", color = "grey50") +
  theme_minimal(base_size = 14) +
  labs(title = "Radiomics Model Performance",
       subtitle = "Lasso-Logistic Regression Classifier",
       x = "False Positive Rate (1 - Specificity)",
       y = "True Positive Rate (Sensitivity)") +
  scale_color_manual(values = c("#2E86AB", "#E94F37")) +
  theme(legend.position = c(0.75, 0.2),
        legend.background = element_rect(fill = "white", color = "grey80"),
        plot.title = element_text(face = "bold"))

print(p)

# --- 8. 自动保存结果 ---
# ggsave("ROC_Performance.png", p, width = 8, height = 6)
# write.csv(active_features, "Selected_Features.csv", row.names = FALSE)

message("\n分析完成！关键特征已提取，ROC 曲线已生成。")

# 增加：特征重要性绘图模块
# 在之前的代码末尾添加：

# 准备特征贡献数据
importance_data <- active_features %>%
  mutate(Importance = abs(Coefficient),
         Direction = ifelse(Coefficient > 0, "Positive", "Negative")) %>%
  head(10) # 取前10个最重要的特征

# 绘制特征贡献图
p_imp <- ggplot(importance_data, aes(x = reorder(Feature, Importance), y = Importance, fill = Direction)) +
  geom_bar(stat = "identity") +
  coord_flip() + # 横向柱状图
  theme_minimal() +
  scale_fill_manual(values = c("Positive" = "#E94F37", "Negative" = "#2E86AB")) +
  labs(title = "Top 10 Clinical Bio-markers",
       subtitle = "Extracted by LASSO Sparse Modeling",
       x = "Radiomics Features",
       y = "Absolute Coefficient (Importance)")

print(p_imp)

# 自动保存图片用于提交
ggsave("roc_curve.png", p, width = 8, height = 6)
ggsave("feature_importance.png", p_imp, width = 8, height = 6)