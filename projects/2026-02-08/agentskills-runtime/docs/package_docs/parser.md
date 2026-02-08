## Package parser
- [Package parser](#package-parser)
  - [enum ExtractGoal](#enum-extractgoal)
    - [enumeration Array](#enumeration-array)
    - [enumeration Object](#enumeration-object)
  - [class ParserException](#class-parserexception)
    - [func init](#func-init)
    - [let reason](#let-reason)
  - [struct ParserUtils](#struct-parserutils)
    - [func extractFirstCode](#func-extractfirstcode)
    - [func extractFirstJsonValue](#func-extractfirstjsonvalue)
    - [func extractFirstValue](#func-extractfirstvalue)
    - [func extractLastCode](#func-extractlastcode)
    - [func extractToolRequest](#func-extracttoolrequest)
    - [func extractToolRequestArray](#func-extracttoolrequestarray)

### enum ExtractGoal
####  Array
```
Array
```
- Description: Represents the goal to extract a JSON array

####  Object
```
Object
```
- Description: Represents the goal to extract a JSON object


### class ParserException
#### func init
```
init(reason: String)
```
- Description: Initializes a new instance of the ParserException class with the specified reason.
- Parameters:
  - `reason`: `String`, The reason for the parser exception.

#### let reason
```
let reason: String
```
- Description: The reason for the parser exception.


### struct ParserUtils
#### func extractFirstCode
```
func extractFirstCode(str: String, lang: String): Option<String>
```
- Description: Extracts the first code block of the specified language from the string
- Parameters:
  - `str`: `String`, The string from which to extract the code block
  - `lang`: `String`, The language of the code block to extract

#### func extractFirstJsonValue
```
func extractFirstJsonValue(str: String, goal!: ExtractGoal): JsonValue
```
- Description: Extracts the first JSON value from the string, using heuristic methods if necessary
- Parameters:
  - `str`: `String`, The string from which to extract the JSON value
  - `goal`: `ExtractGoal`, The type of JSON value to extract (Object or Array)

#### func extractFirstValue
```
func extractFirstValue<T>(str: String): T where T <: Jsonable<T>
```
- Description: Extracts the first value of the specified type from a string containing a JSON value
- Parameters:
  - `str`: `String`, The string from which to extract the value

#### func extractLastCode
```
func extractLastCode(str: String, lang: String): Option<String>
```
- Description: Extracts the last code block of the specified language from the string
- Parameters:
  - `str`: `String`, The string from which to extract the code block
  - `lang`: `String`, The language of the code block to extract

#### func extractToolRequest
```
func extractToolRequest(str: String): ToolRequest
```
- Description: Extracts a tool request from the string by parsing the first JSON object
- Parameters:
  - `str`: `String`, The string from which to extract the tool request

#### func extractToolRequestArray
```
func extractToolRequestArray(str: String): Array<ToolRequest>
```
- Description: Extracts an array of tool requests from the string by parsing the first JSON array
- Parameters:
  - `str`: `String`, The string from which to extract the tool requests


