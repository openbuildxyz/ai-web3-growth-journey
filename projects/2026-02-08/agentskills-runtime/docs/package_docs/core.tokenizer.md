## Package core.tokenizer
- [Package core.tokenizer](#package-core.tokenizer)
  - [interface Tokenizer](#interface-tokenizer)
    - [func countToken](#func-counttoken)
    - [func decode](#func-decode)
    - [func encode](#func-encode)

### interface Tokenizer
#### func countToken
```
func countToken(input: String): Int64
```
- Description: Counts the number of tokens in the input string.
- Parameters:
  - `input`: `String`, The input string for which to count tokens.

#### func decode
```
func decode(tokens: Array<UInt32>): String
```
- Description: Decodes an array of unsigned 32-bit integers back into a string.
- Parameters:
  - `tokens`: `Array<UInt32>`, The array of tokens to be decoded.

#### func encode
```
func encode(input: String): Array<UInt32>
```
- Description: Encodes the input string into an array of unsigned 32-bit integers.
- Parameters:
  - `input`: `String`, The input string to be encoded.


