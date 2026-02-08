## Package jsonable
- [Package jsonable](#package-jsonable)
  - [struct FieldSchema](#struct-fieldschema)
  - [interface FromJsonValue<T>](#interface-fromjsonvalue<t>)
    - [func fromJsonValue](#func-fromjsonvalue)
  - [interface Jsonable<T>](#interface-jsonable<t>)
    - [func getTypeSchema](#func-gettypeschema)
  - [class JsonableException](#class-jsonableexception)
    - [func init](#func-init)
  - [interface ToJsonValue](#interface-tojsonvalue)
    - [func toJsonValue](#func-tojsonvalue)
  - [enum TypeSchema](#enum-typeschema)
    - [enumeration Arr](#enumeration-arr)
    - [enumeration Boolean](#enumeration-boolean)
    - [enumeration Enum](#enumeration-enum)
    - [enumeration Float](#enumeration-float)
    - [enumeration Int](#enumeration-int)
    - [enumeration Obj](#enumeration-obj)
    - [enumeration Str](#enumeration-str)
    - [func toJsonValue](#func-tojsonvalue-1)
    - [func toString](#func-tostring)

### struct FieldSchema

### interface FromJsonValue<T>
#### func fromJsonValue
```
static func fromJsonValue(json: JsonValue): T
```
- Description: Deserialize from a Json value.
- Parameters:
  - `json`: `JsonValue`, The Json value to deserialize from.


### interface Jsonable<T>
#### func getTypeSchema
```
static func getTypeSchema(): TypeSchema
```
- Description: Get the type schema of T.


### class JsonableException
#### func init
```
public init(msg: String)
```
- Description: Initializes a new instance of JsonableException with a specified error message.
- Parameters:
  - `msg`: `String`, The error message that explains the reason for the exception.


### interface ToJsonValue
#### func toJsonValue
```
func toJsonValue(): JsonValue
```
- Description: Converts the implementing type to a JsonValue.


### enum TypeSchema
####  Arr
```
Arr(TypeSchema)
```
- Description: Represents an array type with elements of the specified TypeSchema.
- Parameters:
  - `TypeSchema`: `TypeSchema`, The schema of the array elements.

####  Boolean
```
Boolean
```
- Description: Represents a boolean type.

####  Enum
```
Enum(Array<String>)
```
- Description: Represents an enumeration type with the specified possible values.
- Parameters:
  - `Array<String>`: `Array<String>`, The list of possible string values for the enumeration.

####  Float
```
Float
```
- Description: Represents a floating-point number type.

####  Int
```
Int
```
- Description: Represents an integer type.

####  Obj
```
Obj(Array<FieldSchema>)
```
- Description: Represents an object type with the specified fields.
- Parameters:
  - `Array<FieldSchema>`: `Array<FieldSchema>`, The list of fields in the object.

####  Str
```
Str
```
- Description: Represents a string type.

#### func toJsonValue
```
override public func toJsonValue(): JsonValue
```
- Description: Converts the TypeSchema to a JsonValue.

#### func toString
```
override public func toString(): String
```
- Description: Converts the TypeSchema to a JSON string.


