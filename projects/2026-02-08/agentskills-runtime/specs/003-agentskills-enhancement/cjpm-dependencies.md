# Cangjie Package Manager Dependencies

## Third-Party Libraries

The enhanced skill system leverages the following third-party libraries from the Cangjie ecosystem:

### YAML Processing
- **yaml4cj**: A library for encoding and decoding YAML values in Cangjie programs
  - Repository: https://gitcode.com/Cangjie-TPC/yaml4cj
  - Version: Latest stable release
  - Usage: Parsing YAML frontmatter from SKILL.md files

### Markdown Processing
- **commonmark4cj**: A library for processing markdown content in Cangjie programs according to CommonMark specification
  - Repository: https://gitcode.com/Cangjie-TPC/commonmark4cj
  - Version: Latest stable release
  - Usage: Processing markdown body content from SKILL.md files

## Dependency Declaration

To add these dependencies to the CangjieMagic project, update the `cjpm.toml` file with:

```toml
[dependencies]
  yaml4cj = { git = "https://gitcode.com/Cangjie-TPC/yaml4cj.git", branch="master" }
  commonmark4cj = { git = "https://gitcode.com/Cangjie-TPC/commonmark4cj.git", branch="master" }
```

## Integration Notes

- Both libraries are part of the official Cangjie Third-Party Component (TPC) ecosystem
- These libraries are already available in the local repository at:
  - `apps\CangjieMagic\resource\TPC\yaml4cj`
  - `apps\CangjieMagic\resource\TPC\markdown4cj`
- Using these libraries avoids reinventing existing functionality and ensures compatibility with the broader Cangjie ecosystem