<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0
- Added principles: 代码质量, 测试标准, 用户体验一致性, 性能要求, 仓颉语言规范
- Added sections: 文档语言标准, 开发流程规范
- Templates requiring updates: ⚠ pending (no templates checked yet)
- Follow-up TODOs: RATIFICATION_DATE needs to be determined
-->
# uctoo-admin Constitution

## Core Principles

### 代码质量
所有代码必须遵循高质量标准，包括清晰的命名、适当的注释、易于维护的结构。代码审查是强制性的，必须通过同行评审才能合并。

### 测试标准
所有功能必须有相应的单元测试、集成测试和端到端测试。测试覆盖率必须达到90%以上。遵循测试驱动开发（TDD）方法论。

### 用户体验一致性
所有用户界面和交互必须遵循一致的设计原则和模式。确保跨功能的一致性体验，包括视觉设计、交互模式和错误处理。

### 性能要求
应用必须在各种负载条件下保持高性能。页面加载时间应少于3秒，API响应时间应少于500毫秒。必须进行定期的性能测试和优化。

### 仓颉语言规范
编写仓颉编程语言代码时，必须遵循仓颉语言的语法和词法规则，必须能够在D:\UCT\projects\miniapp\uctoo\Delivery\uctoo-admin\apps\CangjieMagic\resource目录内的仓颉编程资料中找到编程依据，所用的仓颉标准库和仓颉拓展库必须真实存在。必须遵循 D:\UCT\projects\miniapp\uctoo\Delivery\uctoo-admin\.specify\memory\CANGJIE_CODING_GUIDELINES.md 仓颉编程规范

## 文档语言标准

项目的所有文档，包括代码注释、技术文档、用户手册、API文档等，均使用中文编写，以确保中文环境下的开发团队能够无障碍理解和使用。

## 开发流程规范

所有开发活动必须遵循标准化的开发流程，包括需求分析、设计评审、代码实现、测试验证、代码审查和部署发布。确保每个阶段都有明确的质量标准和验收条件。

## 仓颉编程语言代码输出工作流  
1. 严禁直接生成仓颉编程语言代码，必须以遵循本仓颉编程语言代码输出工作流的方式输出仓颉编程语言代码，以确保最终交付的仓颉代码，完全符合仓颉编程语言规范。  
2. 从D:\UCT\projects\miniapp\uctoo\Delivery\uctoo-admin\apps\CangjieMagic\resource 目录、D:\UCT\projects\miniapp\uctoo\Delivery\uctoo-admin\apps\CangjieMagic 目录、D:\UCT\projects\miniapp\uctoo\Delivery\uctoo-admin\apps\fountain 目录检索基本符合项目需求的仓颉代码。复制基本符合项目需求的代码。    
3. 对第2步工作流所复制的基本符合项目需求的代码，按照符合仓颉编程语言规范的方式进行二次编辑，编辑成为完全符合项目需求的代码，输出编辑后的代码到项目的指定位置。  
4. 尽可能多复用仓颉标准库、仓颉拓展库和D:\UCT\projects\miniapp\uctoo\Delivery\uctoo-admin\apps\CangjieMagic\resource\TPC 目录中仓颉第三方库已有的模块和组件。  

## Governance

所有PR和代码审查必须验证是否符合这些原则；所有技术债务必须在引入前进行说明；使用本宪法进行开发治理。

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): 需要确定项目启动的具体日期 | **Last Amended**: 2025-12-07
