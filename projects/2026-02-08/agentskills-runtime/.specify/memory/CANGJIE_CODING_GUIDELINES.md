# 仓颉 (Cangjie) 编程语言编码规范

## 概述
本文档规定了在Uctoo API MCP Server项目中使用仓颉编程语言的编码规范和最佳实践。

## 1. 语法和词法规范

### 1.1 文件结构
- 每个文件必须以版权声明和包声明开始：
  ```cangjie
  /*
   * Copyright (c) 2025. All rights reserved.
   */
  package magic.examples.uctoo_api_mcp_server
  
  import magic.prelude.*
  import magic.examples.uctoo_api_mcp_server.models.*
  ```

### 1.2 导入语句
- 必须使用 `import` 语句导入必要的模块
- 不允许使用 `java.*` 或其他非仓颉标准库的导入
- 所有导入必须来自真实存在的仓颉标准库或项目内部模块
- 按照以下顺序组织导入：
  1. 仓颉标准库 (`magic.*`)
  2. 项目内部模块 (`magic.examples.*`)

### 1.3 类和接口定义
- 类使用 `class` 关键字定义
- 接口使用 `interface` 关键字定义
- 访问修饰符：`public`, `private`, `protected`
- 不能使用 `public` 修饰顶级类（除非必要）

### 1.4 方法定义
- 方法使用 `func` 关键字定义
- 访问修饰符：`public`, `private`, `protected`
- 静态方法使用 `static func` 定义
- 方法参数类型声明在参数名后面：`paramName: ParamType`

### 1.5 变量和常量
- 变量使用 `var` 关键字定义
- 值使用 `val` 关键字定义
- 静态变量使用 `static var` 定义
- 静态常量使用 `static val` 定义
- 类成员变量应在类体中显式声明

### 1.6 注释规范
- 类和公共方法必须有 Javadoc 风格的注释
- 复杂逻辑必须添加解释性注释
- 使用 `/** */` 进行文档注释
- 使用 `//` 进行单行注释

## 2. 数据类型和集合

### 2.1 基本类型
- `Bool`, `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64`, `String`

### 2.2 集合类型
- 使用仓颉标准库的集合类型：`List<T>`, `Map<K,V>`, `Set<T>`
- 创建集合使用标准构造函数：`ArrayList<T>()`, `HashMap<K,V>()`, `HashSet<T>()`

### 2.3 泛型使用
- 泛型类型参数使用大写字母（如 `T`, `K`, `V`）
- 泛型类和方法必须有适当的边界约束

## 3. 异常处理
- 使用 `try-catch-finally` 语句处理异常
- 使用 `Exception` 或其适当子类
- 不要忽略捕获的异常，应该记录或适当地处理

## 4. 字符串处理
- 使用双引号定义字符串：`"string"`
- 使用模板字符串：`"Hello ${name}"`
- 避免字符串拼接，优先使用模板字符串

## 5. 控制流
- 使用 `if-else` 进行条件判断
- 使用 `while` 和 `for` 循行循环
- 使用 `when` 进行多重条件判断
- 避免深层嵌套，深度不应超过3层

## 6. 命名规范
- 包名：小写字母，单词之间用点分隔：`magic.examples.uctoo_api_mcp_server`
- 类名：大驼峰命名法：`NaturalLanguageProcessor`
- 方法名：小驼峰命名法：`processRequest`
- 变量名：小驼峰命名法：`backendUrl`
- 常量名：全大写字母，单词之间用下划线分隔：`MAX_CONNECTIONS`

## 7. 代码组织
- 每个文件专注于单一职责
- 类的方法按功能分组，公共方法在前，私有方法在后
- 避免过长的方法，单个方法不应该超过50行

## 8. 性能考虑
- 使用适当的集合类型以优化性能
- 避免不必要的对象创建
- 考虑内存使用，特别是在循环中

## 9. 安全考虑
- 输入验证：所有外部输入必须验证
- 输出转义：生成输出时应防止注入攻击
- 避免硬编码敏感信息（密码、密钥等）

## 10. 国际化和本地化
- 所有用户可见字符串必须支持中文
- 使用统一的错误消息和日志格式

## 11. 仓颉标准库
### Package List 

The std library includes several packages that provide rich foundational functionalities:

| Package Name | Functionality |
|-------------|--------------|
| [core](./core/core_package_overview.md) | The core package of the standard library, providing the most fundamental API capabilities for Cangjie programming. |
| [argopt](./argopt/argopt_package_overview.md) | The argopt package provides capabilities for parsing parameter names and values from command-line argument strings. |
| [ast](./ast/ast_package_overview.md) | The ast package mainly includes Cangjie source code syntax parsers and Cangjie syntax tree nodes, offering syntax parsing functions. |
| [binary](./binary/binary_package_overview.md) | The binary package provides interfaces for converting between basic data types and binary byte arrays with different endianness, as well as endianness reversal. |
| [collection](./collection/collection_package_overview.md) | The collection package offers efficient implementations of common data structures, definitions of related abstract interfaces, and frequently used functions in collection types. |
| [collection.concurrent](./collection_concurrent/collection_concurrent_package_overview.md) | The collection.concurrent package provides thread-safe implementations of collection types. |
| [console](./console/console_package_overview.md) | The console package provides methods for interacting with standard input, output, and error streams. |
| [convert](./convert/convert_package_overview.md) | The convert package offers Convert series functions for converting strings to specific types, as well as formatting capabilities, primarily for converting Cangjie type instances to formatted strings. |
| [crypto.cipher](./crypto/cipher/cipher_package_overview.md) | The crypto.cipher package provides generic interfaces for symmetric encryption and decryption. |
| [crypto.digest](./crypto/digest/digest_package_overview.md) | The crypto.digest package offers generic interfaces for common digest algorithms, including MD5, SHA1, SHA224, SHA256, SHA384, SHA512, HMAC, and SM3. |
| [database.sql](./database_sql/database_sql_package_overview.md) | The database.sql package provides interfaces for Cangjie to access databases. |
| [deriving](./deriving/deriving_package_overview.md) | The deriving package provides a set of macros for automatically generating interface implementations. |
| [env](./env/env_package_overview.md) | The env package offers information and functionalities related to the current process, including environment variables, command-line arguments, standard streams, and program termination. |
| [fs](./fs/fs_package_overview.md) | The fs (file system) package provides functions for operating on files, directories, paths, and file metadata. |
| [io](./io/io_package_overview.md) | The io package enables data exchange between programs and external devices. |
| [math](./math/math_package_overview.md) | The math package provides common mathematical operations, constant definitions, floating-point number handling, and other functionalities. |
| [math.numeric](./math_numeric/math_numeric_package_overview.md) | The math.numeric package extends capabilities beyond the expressible range of basic types. |
| [net](./net/net_package_overview.md) | The net package provides common network communication functionalities. |
| [objectpool](./objectpool/objectpool_package_overview.md) | The objectpool package offers capabilities for object caching and reuse. |
| [overflow](./overflow/overflow_package_overview.md) | The overflow package provides functionalities related to overflow handling. |
| [posix](./posix/posix_package_overview.md) | The posix package encapsulates POSIX system calls, offering cross-platform system operation interfaces. |
| [process](./process/process_package_overview.md) | The process package mainly provides Process operation interfaces, including process creation, standard stream acquisition, process waiting, and process information querying. |
| [random](./random/random_package_overview.md) | The random package provides capabilities for generating pseudo-random numbers. |
| [reflect](./reflect/reflect_package_overview.md) | The reflect package offers reflection functionalities, enabling programs to obtain type information of various instances at runtime and perform read/write and invocation operations. |
| [regex](./regex/regex_package_overview.md) | The regex package provides capabilities for analyzing and processing text using regular expressions (supporting UTF-8 encoded Unicode strings), including search, split, replace, and validation functionalities. |
| [runtime](./runtime/runtime_package_overview.md) | The runtime package interacts with the program's runtime environment, providing a series of functions and variables for controlling, managing, and monitoring program execution. |
| [sort](./sort/sort_package_overview.md) | The sort package provides sorting functions for array types. |
| [sync](./sync/sync_package_overview.md) | The sync package offers capabilities related to concurrent programming. |
| [time](./time/time_package_overview.md) | The time package provides time-related types, including date-time, time intervals, monotonic time, and time zones, along with functionalities for calculation and comparison. |
| [unicode](./unicode/unicode_package_overview.md) | The unicode package provides capabilities for handling characters according to the Unicode encoding standard. |
| [unittest](./unittest/unittest_package_overview.md) | The unittest package is used for writing unit test code for Cangjie projects, providing basic functionalities including code writing, execution, and debugging. |
| [unittest.mock](./unittest_mock/unittest_mock_package_overview.md) | The unittest.mock package provides a mock framework for Cangjie unit tests, offering APIs to create and configure mock objects that have API signatures consistent with real objects. |
| [unittest.testmacro](./unittest_testmacro/unittest_testmacro_package_overview.md) | The unittest.testmacro package provides macros required by users for the unit testing framework. |
| [unittest.mock.mockmacro](./unittest_mock_mockmacro/unittest_mock_mockmacro_package_overview.md) | The unittest.mock.mockmacro package provides macros required by users for the mock framework. |
| [unittest.common](./unittest_common/unittest_common_package_overview.md) | The unittest.common package provides types and general methods required for printing in the unit testing framework. |
| [unittest.diff](./unittest_diff/unittest_diff_package_overview.md) | The unittest.diff package provides APIs required for printing difference comparison information in the unit testing framework. |
| [unittest.prop_test](./unittest_prop_test/unittest_prop_test_package_overview.md) | The unittest.prop_test package provides types and general methods required for parameterized testing in the unit testing framework. |

## 12. 仓颉拓展库
### Package List 

stdx includes several packages that offer rich extension functionalities:

| Package Name                                                     | Functionality      |
| ---------------------------------------------------------- | --------- |
| [actors](./actors/actors_package_overview.md)    | The `actors` package provides the foundational capabilities for the actor programming model. |
| [actors.macros](./actors/macros/macros_package_overview.md) | The `actors.macros` package provides the ability to transform a class into an active object. |
| [aspectCJ](./aspectCJ/aspectCJ_package_overview.md) | The aspectCJ package provides Aspect-Oriented Programming (AOP) capabilities in Cangjie. |
| [compress.zlib](./compress/zlib/zlib_package_overview.md)                        | The compress package provides compression and decompression functionalities. |
| [crypto.crypto](./crypto/crypto/crypto_package_overview.md)                        | The crypto package provides secure encryption capabilities. |
| [crypto.digest](./crypto/digest/crypto_digest_package_overview.md)                        | The digest package provides commonly used message digest algorithms. |
| [crypto.keys](./crypto/keys/keys_package_overview.md)                        | The keys package provides asymmetric encryption and signature algorithms. |
| [crypto.x509](./crypto/x509/x509_package_overview.md)                        | The x509 package provides functionalities for handling digital certificates. |
| [encoding.base64](./encoding/base64/base64_package_overview.md)                        | The base package provides Base64 encoding and decoding for strings.|
| [encoding.hex](./encoding/hex/hex_package_overview.md)                        | The hex package provides Hex encoding and decoding for strings.|
| [encoding.json](./encoding/json/json_package_overview.md)                        | The json package is used for processing JSON data, enabling mutual conversion between String, JsonValue, and DataModel.|
| [encoding.json.stream](./encoding/json_stream/json_stream_package_overview.md)                        | The json.stream package is primarily used for mutual conversion between Cangjie objects and JSON data streams.|
| [encoding.url](./encoding/url/url_package_overview.md)                        | The url package provides URL-related capabilities, including parsing URL components, encoding and decoding URLs, and merging URLs or paths.|
| [fuzz](./fuzz/fuzz_package_overview.md)                        | The fuzz package provides developers with a coverage-guided fuzz engine for Cangjie and corresponding interfaces, allowing developers to write code to test APIs. |
| [log](./log/log_package_overview.md) | The log package provides logging-related capabilities. |
| [logger](./logger/logger_package_overview.md) | The logger package provides text and JSON format logging functionalities. |
| [net.http](./net/http/http_package_overview.md)                        | The http package provides server and client implementations for HTTP/1.1, HTTP/2, and WebSocket protocols. |
| [net.tls](./net/tls/tls_package_overview.md)                        | The tls package is used for secure encrypted network communication, providing capabilities such as creating TLS servers, performing TLS handshakes based on protocols, sending and receiving encrypted data, and resuming TLS sessions.|
| [serialization](./serialization/serialization_package_overview.md)                        | The serialization package provides serialization and deserialization capabilities. |
| [unittest.data](./unittest/data/data_package_overview.md)                        | The unittest module provides extended unit testing capabilities. |


## 遵循检查
为确保代码符合上述规范，所有代码必须通过以下检查：
1. 无 Java 导入语句
2. 仅使用仓颉标准库和项目内部模块
3. 代码格式符合仓颉语言规范
4. 注释完整且准确
5. 命名符合规范
6. 安全考虑已实施

---
本规范基于 D:\UCT\projects\miniapp\uctooelivery\ucuctooin\apps\CangjieMagic\resource 中的仓颉编程语言文档制定。