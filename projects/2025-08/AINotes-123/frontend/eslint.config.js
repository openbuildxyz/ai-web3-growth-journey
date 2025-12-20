import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "react/display-name": 0,
      "react/prop-types": 0,
      "react/react-in-jsx-scope": 0,
      // 组件没有 children，自动闭合标签
      "react/self-closing-comp": [
        2,
        {
          component: true,
          html: true,
        },
      ],
      "react-hooks/exhaustive-deps": 0,
      "react-hooks/rules-of-hooks": 0,
      "@typescript-eslint/ban-types": 0,
      "@typescript-eslint/no-explicit-any": 0, // 允许 any
      "@typescript-eslint/no-unused-vars": 1,
      // 大括号风格 允许块的开括号和闭括号在 同一行
      "@typescript-eslint/brace-style": [
        2,
        "1tbs",
        {
          allowSingleLine: true,
        },
      ],
      // 禁止 末尾逗号
      "@typescript-eslint/comma-dangle": [2, "never"],
      // 逗号风格 要求在逗号后使用一个或多个空格
      "@typescript-eslint/comma-spacing": [
        2,
        {
          before: false,
          after: true,
        },
      ],
      // 使用一致的缩进风格
      "@typescript-eslint/indent": [
        2,
        2,
        {
          SwitchCase: 1,
        },
      ],
      // 禁止重新声明变量
      "@typescript-eslint/no-redeclare": 2,
      // 禁止抛出字面量和那些不可能是Error对象的表达式
      // '@typescript-eslint/no-throw-literal': 2,
      // 大括号 一致的空格
      "@typescript-eslint/object-curly-spacing": [
        2,
        "always",
        { objectsInObjects: false },
      ],
      // 尽可能 使用单引号
      "@typescript-eslint/quotes": [
        2,
        "single",
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      // 禁止在语句末尾 使用分号;
      "@typescript-eslint/semi": [2, "never"],
      // 块语句必须总是至少有一个前置空格
      "@typescript-eslint/space-before-blocks": [2, "always"],
      // 禁止function与左括号之间有空格
      "@typescript-eslint/space-before-function-paren": [2, "never"],
      // 操作符周围 一致的空格
      "@typescript-eslint/space-infix-ops": 2,
      // 允许 request
      "@typescript-eslint/no-var-requires": 0,

      "comma-dangle": 0,
      "brace-style": 0,
      "comma-spacing": 0,
      indent: 0,
      "no-throw-literal": 2,
      "no-redeclare": 0,
      quotes: 0,
      semi: 0,
      "object-curly-spacing": 0,
      "space-before-blocks": 0,
      "space-before-function-paren": 0,
      "space-infix-ops": 0,
      "no-useless-escape": 0,

      // getter 和 setter 在对象中成对出现
      "accessor-pairs": 2,
      // 箭头函数的箭头前后使用一致的空格
      "arrow-spacing": [
        2,
        {
          before: true,
          after: true,
        },
      ],
      // 代码块中开括号前和闭括号后有空格
      "block-spacing": [2, "always"],
      // 逗号风格 要求逗号放在数组元素、对象属性或变量声明之后，且在同一行
      "comma-style": [2, "last"],
      // 禁止 无效或缺失的 super() 调用
      "constructor-super": 2,
      // 大括号约定  允许在单行中省略大括号
      curly: [2, "multi-line"],
      // 换行时 点操作符和属性放在同一行
      "dot-location": [2, "property"],
      // 非空文件末尾至少存在一行空行
      "eol-last": 2,
      // 要求使用 === 和 !==
      eqeqeq: ["error", "always", { null: "ignore" }],
      // JSX 属性值使用单引号
      "jsx-quotes": [2, "prefer-single"],
      // 对象字面量的键和值之间 一致的空格
      "key-spacing": [
        2,
        {
          beforeColon: false,
          afterColon: true,
        },
      ],
      // new 关键字调用， 首字母必须大写
      "new-cap": [
        2,
        {
          newIsCap: true,
          capIsNew: false,
        },
      ],
      // new 关键字调用， 必须带括号
      "new-parens": 2,
      // 禁止在 if、for、while 和 do...while 语句中出现模棱两可的赋值操作符
      "no-cond-assign": 2,
      // 禁止在 switch 语句中的 case 子句中出现重复的表达式
      "no-duplicate-case": 2,
      // 禁止 空解构
      "no-empty-pattern": 2,
      // 禁用 eval()
      "no-eval": 2,
      // 禁止对 catch 子句中的异常重新赋值
      "no-ex-assign": 2,
      // 静止 case 落空
      "no-fallthrough": 2,
      // 禁止浮点小数
      "no-floating-decimal": 2,
      // 禁止 function 声明出现在嵌套的语句块中
      "no-inner-declarations": [2, "functions"],
      // 禁止在 RegExp 构造函数中出现无效的正则表达式
      "no-invalid-regexp": 2,
      // 禁止不规则的空白
      "no-irregular-whitespace": 2,
      // 禁止 空格和tab混合缩进
      "no-mixed-spaces-and-tabs": 2,
      // 禁止 多个空格
      "no-multi-spaces": 2,
      // 禁止 多行字符串
      "no-multi-str": 2,
      // 禁止 多个空行
      "no-multiple-empty-lines": [2, { max: 1 }],
      // 禁止调用 require 时使用 new 操作符
      "no-new-require": 2,
      // 禁止对 __dirname 和 __filename 进行字符串连接
      "no-path-concat": 2,
      // 禁止在正则表达式字面量中出现多个空格
      "no-regex-spaces": 2,
      // 禁止 return 出现赋值语句，除非使用括号
      "no-return-assign": [2, "except-parens"],
      // 禁止 super() 之前使用 this 或 super
      "no-this-before-super": 2,
      // 禁止行尾空白
      "no-trailing-spaces": 2,
      // 禁止将变量初始化为 undefined
      "no-undef-init": 2,
      // 当有更简单的结构可以代替三元操作符时，禁止使用三元操作符
      "no-unneeded-ternary": [2, { defaultAssignment: false }],
      // 禁止在 return、throw、continue 和 break 语句后出现不可达代码
      "no-unreachable": 2,
      // 禁用不必要的 .call 和 .apply
      "no-useless-call": 2,
      // 禁止在对象中使用不必要的计算属性
      "no-useless-computed-key": 2,
      // 禁止属性前有空格
      "no-whitespace-before-property": 2,
      // 禁用 with 语句
      "no-with": 2,
      // 作用域中的变量 分开声明
      "one-var": [2, { initialized: "never" }],
      // 换行符风格 把换行符放在操作符后面
      "operator-linebreak": [2, "after"],
      // 禁止块语句和类的开始或末尾有空行
      "padded-blocks": [2, "never"],

      // 分号之后强制有空格
      "semi-spacing": [2, { before: false, after: true }],

      // 强制圆括号内没有空格
      "space-in-parens": [2, "never"],
      // 一元操作符 一致的空格
      "space-unary-ops": [2, { words: true, nonwords: false }],
      // 禁止模板字符串中出现空格
      "template-curly-spacing": [2, "never"],
      // 把立即执行的函数包裹起来
      "wrap-iife": [2, "any"],
      // 禁止 “Yoda” 条件
      yoda: [2, "never"],
      // const 声明常量
      "prefer-const": 2,
      // production 时，禁用 debugger
      "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
      // 数组方括号 一致的空格
      "array-bracket-spacing": [2, "never"],
    },
  },
]);
