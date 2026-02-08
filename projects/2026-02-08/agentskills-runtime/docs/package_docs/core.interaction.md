## Package core.interaction
- [Package core.interaction](#package-core.interaction)
  - [class EventStream](#class-eventstream)
    - [func next](#func-next)

### class EventStream
#### func next
```
func next(): Option<InteractionEvent>
```
- Description: Retrieves the next event from the stream. If the stream is finished or a sentinel event is encountered, it returns None.


