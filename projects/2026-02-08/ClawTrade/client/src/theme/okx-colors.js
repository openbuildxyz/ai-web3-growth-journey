/**
 * OKX 风格配色方案
 * 深色主题 + 蓝色强调
 */

export const OKX_COLORS = {
  // 主色 - OKX 蓝
  primary: '#1890FF',
  primaryHover: '#40A9FF',
  primaryLight: 'rgba(24,144,255,0.1)',
  primaryBorder: 'rgba(24,144,255,0.2)',

  // 背景色
  bg: {
    main: '#000000',           // 主背景 - 纯黑
    secondary: '#0a0a0a',      // 次级背景
    card: '#141414',           // 卡片背景
    hover: '#1a1a1a',          // 悬停背景
    input: '#1a1a1a',          // 输入框背景
  },

  // 文字颜色
  text: {
    primary: '#ffffff',        // 主要文字 - 纯白
    secondary: '#8c8c8c',      // 次要文字 - 灰色
    tertiary: '#595959',       // 三级文字 - 深灰
    disabled: '#434343',       // 禁用文字
  },

  // 边框颜色
  border: {
    default: '#262626',        // 默认边框
    light: '#1a1a1a',          // 浅边框
    hover: '#434343',          // 悬停边框
  },

  // 状态颜色
  success: '#00C853',          // 成功/涨 - 绿色
  successHover: '#00E676',
  successLight: 'rgba(0,200,83,0.1)',
  successBorder: 'rgba(0,200,83,0.2)',

  danger: '#FF1744',           // 危险/跌 - 红色
  dangerHover: '#FF5252',
  dangerLight: 'rgba(255,23,68,0.1)',
  dangerBorder: 'rgba(255,23,68,0.2)',

  warning: '#FFA940',          // 警告 - 橙色
  warningLight: 'rgba(255,169,64,0.1)',

  info: '#1890FF',             // 信息 - 蓝色
  infoLight: 'rgba(24,144,255,0.1)',

  // 图表颜色
  chart: {
    line: '#1890FF',
    area: 'rgba(24,144,255,0.1)',
    grid: 'rgba(255,255,255,0.03)',
  },

  // 饼图颜色（保持多样性）
  pie: [
    '#1890FF', '#00C853', '#FFA940', '#F759AB',
    '#722ED1', '#13C2C2', '#52C41A', '#FAAD14',
    '#EB2F96', '#2F54EB', '#FA8C16', '#A0D911'
  ],
};

/**
 * OKX 风格组件样式
 */
export const OKX_STYLES = {
  card: {
    background: OKX_COLORS.bg.card,
    border: `1px solid ${OKX_COLORS.border.default}`,
    borderRadius: '8px',
    transition: 'all 0.2s',
  },

  cardHover: {
    background: OKX_COLORS.bg.hover,
    border: `1px solid ${OKX_COLORS.border.hover}`,
  },

  button: {
    primary: {
      background: OKX_COLORS.primary,
      border: 'none',
      borderRadius: '4px',
      color: '#ffffff',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    success: {
      background: OKX_COLORS.success,
      border: 'none',
      borderRadius: '4px',
      color: '#ffffff',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    danger: {
      background: OKX_COLORS.danger,
      border: 'none',
      borderRadius: '4px',
      color: '#ffffff',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
  },

  input: {
    background: OKX_COLORS.bg.input,
    border: `1px solid ${OKX_COLORS.border.default}`,
    borderRadius: '4px',
    color: OKX_COLORS.text.primary,
    outline: 'none',
    transition: 'all 0.2s',
  },
};
