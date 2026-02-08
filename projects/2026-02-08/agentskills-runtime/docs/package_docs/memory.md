## Package memory
- [Package memory](#package-memory)
  - [class ShortMemory](#class-shortmemory)
    - [func search](#func-search)
    - [func update](#func-update)

### class ShortMemory
#### func search
```
func search(question: String): Array<String>
```
- Description: According to the user question, find related content in the memory.
- Parameters:
  - `question`: `String`, The user question to search for related content in the memory.

#### func update
```
func update(segment: String): Unit
```
- Description: Add a segment of text to the memory.
- Parameters:
  - `segment`: `String`, The segment of text to be added to the memory.


