## Package tokenizer
- [Package tokenizer](#package-tokenizer)
  - [class AbstractBPETokenizer](#class-abstractbpetokenizer)
    - [func countToken](#func-counttoken)
    - [func decode](#func-decode)
    - [func encode](#func-encode)
  - [class BPETokenizer](#class-bpetokenizer)
    - [func init](#func-init)
  - [struct BPETokenizerConfig](#struct-bpetokenizerconfig)
    - [func deserialize](#func-deserialize)
  - [class Cl100kTokenizer](#class-cl100ktokenizer)
    - [func init](#func-init-1)
    - [func init](#func-init-1)
  - [interface JsonDeserializable<T>](#interface-jsondeserializable<t>)
    - [func fromJson](#func-fromjson)
    - [func serialize](#func-serialize)
  - [class Pair<T>](#class-pair<t>)
    - [func !=](#func-!=)
    - [func ==](#func-==)
    - [func hashCode](#func-hashcode)
    - [func init](#func-init-1)
    - [prop left](#prop-left)
    - [prop right](#prop-right)
  - [struct TokenizerJson](#struct-tokenizerjson)
    - [func deserialize](#func-deserialize-1)
  - [class TokenizerLoader](#class-tokenizerloader)
    - [func default](#func-default)
    - [func load](#func-load)
  - [enum TokenizerType](#enum-tokenizertype)
    - [enumeration Cl100k](#enumeration-cl100k)
    - [enumeration DeepSeek](#enumeration-deepseek)
    - [enumeration Qwen](#enumeration-qwen)
    - [func fromString](#func-fromstring)
    - [func toString](#func-tostring)
  - [class UnicodeTokenizer](#class-unicodetokenizer)
    - [func countToken](#func-counttoken-1)
    - [func decode](#func-decode-1)
    - [func encode](#func-encode-1)

### class AbstractBPETokenizer
#### func countToken
```
public func countToken(input: String): Int64
```
- Description: Counts the number of tokens in a string.
- Parameters:
  - `input`: `String`, The string to count tokens in.

#### func decode
```
public func decode(tokens: Array<UInt32>): String
```
- Description: Decodes an array of token IDs into a string.
- Parameters:
  - `tokens`: `Array<UInt32>`, The array of token IDs to decode.

#### func encode
```
public func encode(input: String): Array<UInt32>
```
- Description: Encodes a string into an array of token IDs.
- Parameters:
  - `input`: `String`, The string to encode.


### class BPETokenizer
#### func init
```
init(modelPath: Path)
```
- Description: Initializes the BPETokenizer with the specified model path.
- Parameters:
  - `modelPath`: `Path`, The path to the directory containing the tokenizer configuration files.


### struct BPETokenizerConfig
#### func deserialize
```
static func deserialize(dm: DataModel): BPETokenizerConfig
```
- Description: Deserializes a DataModel into a BPETokenizerConfig object.
- Parameters:
  - `dm`: `DataModel`, The DataModel to deserialize.


### class Cl100kTokenizer
#### func init
```
init(tikTokenPath: Path)
```
- Description: Initializes the Cl100kTokenizer with a path to the TikToken configuration file.
- Parameters:
  - `tikTokenPath`: `Path`, The path to the TikToken configuration file.

#### func init
```
init(tikTokenContent: String)
```
- Description: Initializes the Cl100kTokenizer with the content of the TikToken configuration.
- Parameters:
  - `tikTokenContent`: `String`, The content of the TikToken configuration.


### interface JsonDeserializable<T>
#### func fromJson
```
static func fromJson(str: String)
```
- Description: Creates an object from a JSON string.
- Parameters:
  - `str`: `String`, The JSON string to deserialize.

#### func serialize
```
func serialize(): DataModel
```
- Description: Serializes the object into a DataModel.


### class Pair<T>
#### func operator !=
```
public operator func !=(other: Pair<T>): Bool
```
- Description: Checks if two pairs are not equal.
- Parameters:
  - `other`: `Pair<T>`, The other pair to compare with.

#### func operator ==
```
public operator func ==(other: Pair<T>): Bool
```
- Description: Checks if two pairs are equal.
- Parameters:
  - `other`: `Pair<T>`, The other pair to compare with.

#### func hashCode
```
public func hashCode(): Int64
```
- Description: Computes the hash code of the pair.

#### func init
```
public init(left: T, right: T)
```
- Description: Initializes a Pair with left and right values.
- Parameters:
  - `left`: `T`, The left value of the pair.
  - `right`: `T`, The right value of the pair.

#### prop left
```
public prop left: T
```
- Description: Gets the left value of the pair.

#### prop right
```
public prop right: T
```
- Description: Gets the right value of the pair.


### struct TokenizerJson
#### func deserialize
```
static func deserialize(dm: DataModel): TokenizerJson
```
- Description: Deserializes a DataModel into a TokenizerJson object.
- Parameters:
  - `dm`: `DataModel`, The DataModel to deserialize.


### class TokenizerLoader
#### func default
```
func default(): Tokenizer
```
- Description: Returns the default tokenizer. If no default tokenizer is configured, returns a UnicodeTokenizer.

#### func load
```
func load(tokenizerType: TokenizerType, vocabPath: String): Tokenizer
```
- Description: Loads a tokenizer based on the specified tokenizer type and vocabulary path.
- Parameters:
  - `tokenizerType`: `TokenizerType`, The type of tokenizer to load.
  - `vocabPath`: `String`, The path to the vocabulary file for the tokenizer.


### enum TokenizerType
####  Cl100k
```
Cl100k
```
- Description: Represents the Cl100k tokenizer type.

####  DeepSeek
```
DeepSeek
```
- Description: Represents the DeepSeek tokenizer type.

####  Qwen
```
Qwen
```
- Description: Represents the Qwen tokenizer type.

#### func fromString
```
func fromString(ttype: String): TokenizerType
```
- Description: Converts a string to the corresponding TokenizerType enum value.
- Parameters:
  - `ttype`: `String`, The string representation of the tokenizer type.

#### func toString
```
func toString()
```
- Description: Converts the tokenizer type to a string representation.


### class UnicodeTokenizer
#### func countToken
```
func countToken(input: String): Int64
```
- Description: Counts the number of tokens in a string, adjusting for Chinese and English characters.
- Parameters:
  - `input`: `String`, The string whose tokens are to be counted.

#### func decode
```
func decode(tokens: Array<UInt32>): String
```
- Description: Decodes an array of tokens into a string.
- Parameters:
  - `tokens`: `Array<UInt32>`, An array of tokens to be decoded.

#### func encode
```
func encode(input: String): Array<UInt32>
```
- Description: Encodes a string into an array of tokens.
- Parameters:
  - `input`: `String`, The string to be encoded.


