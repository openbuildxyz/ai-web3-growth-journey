## Package core.memory
- [Package core.memory](#package-core.memory)
  - [interface Memory](#interface-memory)
    - [func search](#func-search)
    - [func update](#func-update)

### interface Memory
#### func search
```
func search(question: String): Array<String>
```
- Description: According to the user question, find related content in the memory
- Parameters:
  - `question`: `String`, The user question to search for in the memory

#### func update
```
func update(segment: String): Unit
```
- Description: Update the memory
- Parameters:
  - `segment`: `String`, The segment to update in the memory


