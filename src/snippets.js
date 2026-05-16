export function getSnippets(lang, traversal, tree, maxChildren, focusMode) {
    const isBinary = maxChildren <= 2;
    const isTernary = maxChildren === 3;
    const serializedTree = serializeTree(tree, lang, maxChildren);
    
    const templates = {
        js: {
            setup: isBinary ? `class Node {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
    this.children = [left, right].filter(c => c !== null);
  }
}

const root = ${serializedTree};
const MODE = "${traversal.toUpperCase()}";
` : isTernary ? `class Node {
  constructor(value, left = null, middle = null, right = null) {
    this.value = value;
    this.left = left;
    this.middle = middle;
    this.right = right;
    this.children = [left, middle, right].filter(c => c !== null);
  }
}

const root = ${serializedTree};
const MODE = "${traversal.toUpperCase()}";
` : `class Node {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }
}

const root = ${serializedTree};
const MODE = "${traversal.toUpperCase()}";
`,
            methods: {
                preorder: isBinary 
                    ? `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  preorder(node.left);\n  preorder(node.right);\n}`
                    : isTernary
                    ? `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  preorder(node.left);\n  preorder(node.middle);\n  preorder(node.right);\n}`
                    : `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  for (let child of node.children) {\n    preorder(child);\n  }\n}`,
                inorder: `function inorder(node) {\n  if (!node) return;\n  inorder(node.left);\n  console.log(node.value);\n  inorder(node.right);\n}`,
                postorder: isBinary
                    ? `function postorder(node) {\n  if (!node) return;\n  postorder(node.left);\n  postorder(node.right);\n  console.log(node.value);\n}`
                    : isTernary
                    ? `function postorder(node) {\n  if (!node) return;\n  postorder(node.left);\n  postorder(node.middle);\n  postorder(node.right);\n  console.log(node.value);\n}`
                    : `function postorder(node) {\n  if (!node) return;\n  for (let child of node.children) {\n    postorder(child);\n  }\n  console.log(node.value);\n}`
            },
            footer: `
if (MODE === "PREORDER") preorder(root);
else if (MODE === "INORDER") inorder(root);
else if (MODE === "POSTORDER") postorder(root);`
        },
        python: {
            setup: isBinary ? `class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right
        self.children = [c for c in [left, right] if c is not None]

root = ${serializedTree}
MODE = "${traversal.toUpperCase()}"
` : isTernary ? `class Node:
    def __init__(self, value, left=None, middle=None, right=None):
        self.value = value
        self.left = left
        self.middle = middle
        self.right = right
        self.children = [c for c in [left, middle, right] if c is not None]

root = ${serializedTree}
MODE = "${traversal.toUpperCase()}"
` : `class Node:
    def __init__(self, value, children=None):
        self.value = value
        self.children = children or []

root = ${serializedTree}
MODE = "${traversal.toUpperCase()}"
`,
            methods: {
                preorder: isBinary
                    ? `def preorder(node):\n    if not node: return\n    print(node.value)\n    preorder(node.left)\n    preorder(node.right)`
                    : isTernary
                    ? `def preorder(node):\n    if not node: return\n    print(node.value)\n    preorder(node.left)\n    preorder(node.middle)\n    preorder(node.right)`
                    : `def preorder(node):\n    if not node: return\n    print(node.value)\n    for child in node.children:\n        preorder(child)`,
                inorder: `def inorder(node):\n    if not node: return\n    inorder(node.left)\n    print(node.value)\n    inorder(node.right)`,
                postorder: isBinary
                    ? `def postorder(node):\n    if not node: return\n    postorder(node.left)\n    postorder(node.right)\n    print(node.value)`
                    : isTernary
                    ? `def postorder(node):\n    if not node: return\n    postorder(node.left)\n    postorder(node.middle)\n    postorder(node.right)\n    print(node.value)`
                    : `def postorder(node):\n    if not node: return\n    for child in node.children:\n        postorder(child)\n    print(node.value)`
            },
            footer: `
if MODE == "PREORDER": preorder(root)
elif MODE == "INORDER": inorder(root)
elif MODE == "POSTORDER": postorder(root)`
        },
        csharp: {
            setup: isBinary ? `using System;
using System.Collections.Generic;

public class Node {
    public int Value { get; set; }
    public Node Left { get; set; }
    public Node Right { get; set; }
    public List<Node> Children { get; set; }

    public Node(int value, Node left = null, Node right = null) {
        Value = value;
        Left = left;
        Right = right;
        Children = new List<Node>();
        if (left != null) Children.Add(left);
        if (right != null) Children.Add(right);
    }
}

class Program {
    static void Main() {
        Node root = ${serializedTree};
        string mode = "${traversal.toUpperCase()}";
` : isTernary ? `using System;
using System.Collections.Generic;

public class Node {
    public int Value { get; set; }
    public Node Left { get; set; }
    public Node Middle { get; set; }
    public Node Right { get; set; }
    public List<Node> Children { get; set; }

    public Node(int value, Node left = null, Node middle = null, Node right = null) {
        Value = value;
        Left = left;
        Middle = middle;
        Right = right;
        Children = new List<Node>();
        if (left != null) Children.Add(left);
        if (middle != null) Children.Add(middle);
        if (right != null) Children.Add(right);
    }
}

class Program {
    static void Main() {
        Node root = ${serializedTree};
        string mode = "${traversal.toUpperCase()}";
` : `using System;
using System.Collections.Generic;

public class Node {
    public int Value { get; set; }
    public List<Node> Children { get; set; }

    public Node(int value, List<Node> children = null) {
        Value = value;
        Children = children ?? new List<Node>();
    }
}

class Program {
    static void Main() {
        Node root = ${serializedTree};
        string mode = "${traversal.toUpperCase()}";
`,
            methods: {
                preorder: isBinary
                    ? `    static void PreOrder(Node node) {\n        if (node == null) return;\n        Console.WriteLine(node.Value);\n        PreOrder(node.Left);\n        PreOrder(node.Right);\n    }`
                    : isTernary
                    ? `    static void PreOrder(Node node) {\n        if (node == null) return;\n        Console.WriteLine(node.Value);\n        PreOrder(node.Left);\n        PreOrder(node.Middle);\n        PreOrder(node.Right);\n    }`
                    : `    static void PreOrder(Node node) {\n        if (node == null) return;\n        Console.WriteLine(node.Value);\n        foreach (var child in node.Children) {\n            PreOrder(child);\n        }\n    }`,
                inorder: `    static void InOrder(Node node) {\n        if (node == null) return;\n        InOrder(node.Left);\n        Console.WriteLine(node.Value);\n        InOrder(node.Right);\n    }`,
                postorder: isBinary
                    ? `    static void PostOrder(Node node) {\n        if (node == null) return;\n        PostOrder(node.Left);\n        PostOrder(node.Right);\n        Console.WriteLine(node.Value);\n    }`
                    : isTernary
                    ? `    static void PostOrder(Node node) {\n        if (node == null) return;\n        PostOrder(node.Left);\n        PostOrder(node.Middle);\n        PostOrder(node.Right);\n        Console.WriteLine(node.Value);\n    }`
                    : `    static void PostOrder(Node node) {\n        if (node == null) return;\n        foreach (var child in node.Children) {\n            PostOrder(child);\n        }\n        Console.WriteLine(node.Value);\n    }`
            },
            footer: `
        if (mode == "PREORDER") PreOrder(root);
        else if (mode == "INORDER") InOrder(root);
        else if (mode == "POSTORDER") PostOrder(root);
    }
}`
        }
    };

    const t = templates[lang];
    let code = t.setup + "\n";
    
    for (const [mName, mBody] of Object.entries(t.methods)) {
        if (mName === 'inorder' && !isBinary) continue;
        
        if (focusMode && mName !== traversal) {
            // Collapsed version
            if (lang === 'js') code += `function ${mName}(node) { /* ... */ }\n`;
            else if (lang === 'python') code += `def ${mName}(node): pass # ...\n`;
            else if (lang === 'csharp') code += `    static void ${mName.charAt(0).toUpperCase() + mName.slice(1)}(Node node) { /* ... */ }\n`;
        } else {
            code += mBody + "\n";
        }
    }
    
    code += t.footer;
    return code;
}

function serializeTree(tree, lang, maxChildren) {
    if (!tree.root) return lang === 'python' ? 'None' : 'null';
    
    const serializeNode = (node) => {
        if (maxChildren <= 3) {
            const childLimit = maxChildren === 3 ? 3 : 2;
            let children = [];
            for (let i = 0; i < childLimit; i++) {
                children.push(node.children[i] ? serializeNode(node.children[i]) : null);
            }
            
            // Map nulls to language-specific strings
            let childArgs = children.map(c => c || (lang === 'python' ? 'None' : 'null'));
            
            // Trim trailing nulls
            while (childArgs.length > 0 && childArgs[childArgs.length - 1] === (lang === 'python' ? 'None' : 'null')) {
                childArgs.pop();
            }
            
            const args = [node.value, ...childArgs];
            const prefix = lang === 'python' ? '' : 'new ';
            return `${prefix}Node(${args.join(', ')})`;
        } else {
            const childStrs = node.children.map(c => serializeNode(c));
            if (childStrs.length === 0) {
                return lang === 'python' ? `Node(${node.value})` : `new Node(${node.value})`;
            }
            if (lang === 'js') return `new Node(${node.value}, [${childStrs.join(', ')}])`;
            if (lang === 'python') return `Node(${node.value}, [${childStrs.join(', ')}])`;
            if (lang === 'csharp') return `new Node(${node.value}, new List<Node> { ${childStrs.join(', ')} })`;
        }
        return "";
    };

    return serializeNode(tree.root);
}
