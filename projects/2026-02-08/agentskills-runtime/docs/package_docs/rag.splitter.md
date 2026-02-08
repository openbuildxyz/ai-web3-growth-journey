## Package rag.splitter
- [Package rag.splitter](#package-rag.splitter)
  - [class CharacterTextSplitter](#class-charactertextsplitter)
    - [func split](#func-split)
  - [class DocumentLoader](#class-documentloader)
    - [func load](#func-load)
    - [func loadSplit](#func-loadsplit)
  - [class MarkdownSplitter](#class-markdownsplitter)
    - [func init](#func-init)
    - [func split](#func-split-1)
  - [class RecursiveCharacterTextSplitter](#class-recursivecharactertextsplitter)
    - [func init](#func-init-1)
    - [func split](#func-split-1)
  - [interface Splitter](#interface-splitter)
    - [func split](#func-split-1)

### class CharacterTextSplitter
#### func split
```
func split(text: String): Array<Document>
```
- Description: Splits the input text into an array of Document objects based on the chunk size and separator.
- Parameters:
  - `text`: `String`, The input text to be split into documents.


### class DocumentLoader
#### func load
```
func load(): Array<Document>
```
- Description: Loads documents from a file path specified in the class instance.

#### func loadSplit
```
func loadSplit(splitter: Splitter): Array<Document>
```
- Description: Loads documents from a file and splits them using the provided splitter.
- Parameters:
  - `splitter`: `Splitter`, The splitter used to divide the document content into parts.


### class MarkdownSplitter
#### func init
```
init(headersToSplit!: Array<(String, String)>, returnEachLine!: Bool, stripHeader!: Bool)
```
- Description: Initializes the MarkdownSplitter with specified headers to split, whether to return each line, and whether to strip headers.
- Parameters:
  - `headersToSplit`: `Array<(String, String)>`, Headers we want to track.
  - `returnEachLine`: `Bool`, Return each line with associated headers.
  - `stripHeader`: `Bool`, Strip split headers from the content of the chunk.

#### func split
```
func split(text: String): Array<Document>
```
- Description: Splits a markdown file into documents based on specified headers.
- Parameters:
  - `text`: `String`, Markdown file to be split.


### class RecursiveCharacterTextSplitter
#### func init
```
init(separators!: Array<String> = ["\n\n", "\n", " ", ""], chunkSize!: Int64 = 1024, chunkOverlap!: Int64 = 256, keepSeparator!: Bool = false)
```
- Description: Initializes the RecursiveCharacterTextSplitter with specified separators, chunk size, chunk overlap, and keep separator flag.
- Parameters:
  - `separators`: `Array<String>`, An array of strings used as separators for splitting text. Defaults to ["\n\n", "\n", " ", ""].
  - `chunkSize`: `Int64`, The maximum size of each chunk. Defaults to 1024.
  - `chunkOverlap`: `Int64`, The number of characters that chunks should overlap. Defaults to 256.
  - `keepSeparator`: `Bool`, A flag indicating whether to keep the separator in the chunks. Defaults to false.

#### func split
```
func split(text: String): Array<Document>
```
- Description: Splits the input text into an array of Document objects using the specified separators.
- Parameters:
  - `text`: `String`, The text to be split into chunks.


### interface Splitter
#### func split
```
func split(text: String): Array<Document>
```
- Description: Splits the given text into an array of documents.
- Parameters:
  - `text`: `String`, The text to be split into documents.


