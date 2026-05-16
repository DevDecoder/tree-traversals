# Tree Traversals Language Format (`.lang`)

The Tree Traversal Explorer relies on a simple, language-agnostic `.lang` template engine to generate the tree code and the execution algorithm.

This documentation outlines how to create or modify a language template file to support a new language, structure, or pseudocode format.

## File Structure Overview

A `.lang` file consists of:
1. **Metadata block (`[meta]...[/meta]`)** for configuration
2. **Structural blocks (`[node]`, `[leaf]`, `[empty]`)** defining how to construct the tree
3. **Global Code** that appears on-screen exactly as written
4. **Conditional Traversal blocks (`[preorder]`, `[inorder]`, `[postorder]`)** describing the algorithm code
5. **Conditional Arity blocks (`[binary]`, `[ternary]`, `[nary]`, and negatives)** for inline code deduplication

---

## 1. Metadata Block `[meta]`

At the very top of your `.lang` file, define the metadata.

```text
[meta]
name: C#
id: csharp
categories: 🇬🇧 AQA, 🇬🇧 OCR, OOP
highlight: csharp
logo: https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg
[/meta]
```

- **`name`**: Display name in the UI dropdown.
- **`id`**: Unique identifier (alphanumeric, no spaces).
- **`categories`**: Comma-separated list for filtering. Please refer to `CONTRIBUTING.md` for guidance on categories used in this repository.
- **`highlight`**: The `highlight.js` language alias used for syntax highlighting.
- **`logo`**: A URL (e.g., from `devicon`) or emoji to display alongside the name.

---

## 2. Structural Blocks

The engine uses these templates recursively/iteratively to build the visual tree in code. The tags `{{value}}`, `{{children}}`, `{{left}}`, `{{middle}}`, and `{{right}}` are automatically injected.

### `[node]`
The template for creating a node that has children.
```text
[node]
new Node({{value}}[nary], [{{children}}][/nary][!nary], {{left}}[/!nary][ternary], {{middle}}[/ternary][!nary], {{right}}[/!nary])
[/node]
```

### `[leaf]`
The template for creating a node with NO children. (Saves generating unnecessary null/empty parameters).
```text
[leaf]
new Node({{value}})
[/leaf]
```

### `[empty]`
The template used when a specific child position is null/empty.
```text
[empty]
null
[/empty]
```

---

## 3. Conditional Arity Blocks (Inline Deduplication)

To keep templates DRY (Don't Repeat Yourself), you can use arity pre-processor tags. These work inline and across multiple lines. The engine strips out code that doesn't belong to the user's currently selected tree type (Binary, Ternary, or N-ary).

- **`[binary]...[/binary]`**: Only included for binary trees.
- **`[ternary]...[/ternary]`**: Only included for ternary trees.
- **`[nary]...[/nary]`**: Only included for n-ary trees.

You can also negate them to include code when *not* in a specific mode:
- **`[!binary]...[/!binary]`**: Included in Ternary and N-ary.
- **`[!ternary]...[/!ternary]`**: Included in Binary and N-ary.
- **`[!nary]...[/!nary]`**: Included in Binary and Ternary.

### Example
```csharp
public Node(int value[nary], List<Node> children = null[/nary][!nary], Node left = null[/!nary][ternary], Node middle = null[/ternary][!nary], Node right = null[/!nary])
```
If the user selects a Ternary tree, the above elegantly resolves to:
```csharp
public Node(int value, Node left = null, Node middle = null, Node right = null)
```

---

## 4. Conditional Traversal Blocks & Focus Mode

These blocks wrap the algorithm logic. The UI features a "Focus Mode" toggle. 
- When **Focus Mode is ON** (default), the engine hides all traversal modes except the currently active one to keep the code panel clean for the student.
- When **Focus Mode is OFF**, all traversal modes are shown simultaneously to provide a full, holistic view of the implementation.

You define positive traversal blocks as `[preorder]`, `[inorder]`, and `[postorder]`.

```javascript
[preorder]
function preorder(node) {
  // Logic
}
[/preorder]
```

### Focus Mode and Negative Blocks

To support elegant code layouts when Focus Mode changes, the engine handles blocks differently depending on the Focus Mode state:

- **Focus Mode ON (Default)**: The engine extracts *only* the contents of the currently active positive traversal blocks (e.g., `[preorder]`), active negative traversal blocks (e.g., `[!inorder]`), and `[focus]` blocks. **Any text outside of these blocks (like class definitions or execution boilerplate) is automatically hidden.** This ensures the student sees only the core algorithm.
- **Focus Mode OFF**: The engine displays the entire file, stripping active traversal tags and keeping their content, while completely hiding any `[focus]` or negative traversal (`[!mode]`) blocks. 

If you want specific boilerplate or helper functions to remain visible even when Focus Mode is ON, wrap them in `[focus]...[/focus]`:

- **`[focus]...[/focus]`**: Always shown when Focus Mode is ON, hidden when Focus Mode is OFF.
- **`[!preorder]...[/!preorder]`**: Shown when Focus Mode is ON and the active mode is *not* preorder.

This automatic hiding of non-block text in Focus Mode allows you to write natural execution boilerplate (e.g., `if (mode === "PRE") preorder(root)`) at the bottom of your file without it cluttering the screen during focused study.

**Note on In-Order**: In-order traversal is mathematically restricted to binary trees. Therefore, the `[inorder]` block is inherently treated as if it were wrapped in a `[binary]` tag; it will be automatically stripped when the user views Ternary or N-ary trees. You do NOT need to manually wrap it inside `[binary]...[/binary]`.

---

## 5. UI Highlighting Event Hooks

To connect your code to the UI's step-by-step visualizer, you must wrap specific lines with the following hooks.

- **`[enter]`**: Marks the initial function entry and base case check. The traversal engine fires an 'enter' event the moment a recursive function call begins. Highlighting this line shows the student that the function has just been invoked and is checking if it should return (e.g., if the node is null). Example: `[enter]if (node == null) return;[/enter]`
- **`[visit]`**: Marks where the node is processed/printed. Example: `[visit]print(node.value)[/visit]`
- **`[move:left]`**: Moving to the left child.
- **`[move:middle]`**: Moving to the middle child (Ternary).
- **`[move:right]`**: Moving to the right child.
- **`[move:next]`**: Moving to the next child in an array/list iteration (N-ary).

### Example
```javascript
[preorder]
function preorder(node) {
  [enter]if (!node) return;[/enter]
  [visit]console.log(node.value);[/visit]
  [nary]for (let child of node.children) {
    [move:next]preorder(child);[/move:next]
  }[/nary][!nary][move:left]preorder(node.left);[/move:left][ternary]
  [move:middle]preorder(node.middle);[/move:middle][/ternary]
  [move:right]preorder(node.right);[/move:right][/!nary]
}
[/preorder]
```

---

## 6. Variables Reference

The engine exposes the following data points that you can inject into global text or blocks using `{{variableName}}` syntax. No external templating libraries are required; the engine performs a direct native string replacement.

### Recursive Injection Variables
These variables recursively evaluate the `[node]` or `[leaf]` templates for the respective children. If a child does not exist, they evaluate to the `[empty]` template.
- `{{left}}`: The evaluated template of the left child.
- `{{middle}}`: The evaluated template of the middle child.
- `{{right}}`: The evaluated template of the right child.
- `{{nestedTree}}`: Evaluates the root node, generating the entire structure.

### Child Iteration Blocks (N-ary Trees)
For N-ary trees, the children of a node are generated by iterating over them. Because different languages require different list separators (e.g., commas vs line breaks), you define the iteration format using `[children]` blocks:

- `[children]...[/children]`: The default template for each child.
- `[children:first]...[/children:first]`: Optional override for the first child (useful for omitting leading commas).
- `[children:last]...[/children:last]`: Optional override for the last child.

Inside these blocks, you can use:
- `{{child}}`: Recursively evaluates the `[node]` or `[leaf]` template for this specific child.
- `{{childValue}}`: Injects the literal value (ID) of the child.

**Example for a comma-separated list (C#, Java, Python, JS):**
```csharp
[node]
new Node({{value}}, new List<Node> { [children:first]{{child}}[/children:first][children], {{child}}[/children] })
[/node]
```

**Example for line-break separated statements (SQL):**
```sql
[node]
INSERT INTO tree ... VALUES ({{value}});
[children]
{{child}}[/children]
[/node]
```

### Value Injection Variables
These variables inject the raw literal value (ID) of the node. If a child does not exist, they inject the string `"NULL"`.
- `{{value}}`: The current node's value.
- `{{leftValue}}`: The left child's value.
- `{{middleValue}}`: The middle child's value.
- `{{rightValue}}`: The right child's value.
- `{{parentValue}}`: The parent node's value.
- `{{rootValue}}`: The root node's value (useful for SQL or external references).

### Other Variables
- `{{mode}}`: Injects the current traversal mode string (`PRE`, `IN`, or `POST`).

Any text written outside of tags behaves exactly as written (e.g., class declarations, main function wrappers, basic imports).
