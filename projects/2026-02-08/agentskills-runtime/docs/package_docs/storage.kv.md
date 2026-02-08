## Package storage.kv
- [Package storage.kv](#package-storage.kv)
  - [class JsonKVStorage<T>](#class-jsonkvstorage<t>)
    - [func close](#func-close)
    - [prop collection](#prop-collection)
    - [func commit](#func-commit)
    - [func get](#func-get)
    - [func init](#func-init)
    - [func insertInc](#func-insertinc)
    - [func remove](#func-remove)
    - [func reset](#func-reset)
    - [func upsert](#func-upsert)
    - [prop workspace](#prop-workspace)
  - [interface KVStorage<T>](#interface-kvstorage<t>)
    - [func get](#func-get-1)
    - [func remove](#func-remove-1)
    - [func upsert](#func-upsert-1)
  - [interface LocalKVStorage<T>](#interface-localkvstorage<t>)

### class JsonKVStorage<T>
#### func close
```
func close(): Unit
```
- Description: Closes the storage and releases any resources.

#### prop collection
```
prop collection: String
```
- Description: Gets the name of the collection.

#### func commit
```
func commit(): Unit
```
- Description: Commits all pending changes to the storage.

#### func get
```
func get(id: String): Option<T>
```
- Description: Retrieves the value associated with the specified ID.
- Parameters:
  - `id`: `String`, The ID of the value to retrieve.

#### func init
```
init(workspace!: String = ".storage", collection!: String = "default")
```
- Description: Initializes a new instance of JsonKVStorage with the specified workspace and collection.
- Parameters:
  - `workspace`: `String`, The directory path where the storage files will be kept. Defaults to '.storage'.
  - `collection`: `String`, The name of the collection. Defaults to 'default'.

#### func insertInc
```
func insertInc(value: T): String
```
- Description: Inserts a value with an auto-incremented ID.
- Parameters:
  - `value`: `T`, The value to insert.

#### func remove
```
func remove(id: String): Option<T>
```
- Description: Removes the value associated with the specified ID.
- Parameters:
  - `id`: `String`, The ID of the value to remove.

#### func reset
```
func reset(): Unit
```
- Description: Clears all data in the storage and commits the changes.

#### func upsert
```
func upsert(id: String, value: T): Unit
```
- Description: Updates or inserts a value with the specified ID.
- Parameters:
  - `id`: `String`, The ID of the value to update or insert.
  - `value`: `T`, The value to update or insert.

#### prop workspace
```
prop workspace: String
```
- Description: Gets the workspace directory path.


### interface KVStorage<T>
#### func get
```
func get(id: String): Option<T>
```
- Description: Retrieves a value associated with the given ID.
- Parameters:
  - `id`: `String`, The identifier for the value to retrieve.

#### func remove
```
func remove(id: String): Option<T>
```
- Description: Removes a value associated with the given ID and returns it.
- Parameters:
  - `id`: `String`, The identifier for the value to remove.

#### func upsert
```
func upsert(id: String, value: T): Unit
```
- Description: Updates or inserts a value associated with the given ID.
- Parameters:
  - `id`: `String`, The identifier for the value to update or insert.
  - `value`: `T`, The value to be updated or inserted.


### interface LocalKVStorage<T>

