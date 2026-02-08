## Package storage
- [Package storage](#package-storage)
  - [interface LocalStorage](#interface-localstorage)
    - [func close](#func-close)
    - [prop collection](#prop-collection)
    - [func commit](#func-commit)
    - [func reset](#func-reset)
    - [prop workspace](#prop-workspace)

### interface LocalStorage
#### func close
```
func close(): Unit
```
- Description: Closes the LocalStorage interface.

#### prop collection
```
prop collection: String
```
- Description: Represents the collection property of the LocalStorage interface.

#### func commit
```
func commit(): Unit
```
- Description: Commits the current state of the LocalStorage.

#### func reset
```
func reset(): Unit
```
- Description: Resets the LocalStorage interface to its initial state.

#### prop workspace
```
prop workspace: String
```
- Description: Represents the workspace property of the LocalStorage interface.


