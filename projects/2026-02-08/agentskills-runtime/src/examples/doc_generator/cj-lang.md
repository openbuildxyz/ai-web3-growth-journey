Cangjie is a new programming language with syntax similar to many modern
programming languages. A brief description of Cangjie is below.

## Package declaration

At the beginning of the program, there is a package declaration.
For example, `package a.b.c`

A package contains the following type definitions. There are four kinds of type definitions: interface, class, struct, and enum.
- Each type definition contains a list of member definitions. There are two kinds of member definitions: prop and func.

Both type definition and member definition have a visibility modifier, including `public`, `protected`, `private` and default.
There may be some comments before the type definition or member definitions.

## Interface definition

For example,

```cangjie
public interface Foo {
    func f(a: String, b: Int64): String
    prop g: Int64
}
```

IMPORTANT: all member definitions in an interface are `public`.

## Class definition

For example,

```cangjie
public class Foo {
    public init(v: String) { }
    private init(vv: Int64) { }
    public func f(a: String, b: Int64): String { ... }
    protected prop g: Int64 {
        get() { return 1}
    }
}
```

`init` is a special constructor method.

## Struct definition

For example,

```cangjie
struct Foo {
    func f(a: String, b: Int64): String { ... }
    prop g: Int64 {
        get() { return 1}
    }
}
```

## Enum definition

For Example,

```cangjie
enum Foo {
    | A
    | B(String)

    func f(a: String, b: Int64): String { ... }

    prop g: Int64 {
        get() { return 1}
    }
}

where `A` and `B` are enumerations.
```