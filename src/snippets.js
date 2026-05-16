export function getSnippets(lang, traversal, tree, maxChildren, focusMode) {
    const isBinary = maxChildren <= 2;
    const isTernary = maxChildren === 3;
    const serializedTree = serializeTree(tree, lang, maxChildren);
    
    const templates = {
        js: {
            setup: `class Node {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
    ${isBinary ? 'this.left = children[0]; this.right = children[1];' : ''}
    ${isTernary ? 'this.left = children[0]; this.middle = children[1]; this.right = children[2];' : ''}
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
            setup: `class Node:
    def __init__(self, value, children=None):
        self.value = value
        self.children = children or []
        ${isBinary ? 'self.left = self.children[0] if len(self.children) > 0 else None\n        self.right = self.children[1] if len(self.children) > 1 else None' : ''}
        ${isTernary ? 'self.left = self.children[0] if len(self.children) > 0 else None\n        self.middle = self.children[1] if len(self.children) > 1 else None\n        self.right = self.children[2] if len(self.children) > 2 else None' : ''}

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
            setup: `using System;
using System.Collections.Generic;

public class Node {
    public int Value { get; set; }
    public List<Node> Children { get; set; }
    ${isBinary ? 'public Node Left => Children.Count > 0 ? Children[0] : null;\n    public Node Right => Children.Count > 1 ? Children[1] : null;' : ''}
    ${isTernary ? 'public Node Left => Children.Count > 0 ? Children[0] : null;\n    public Node Middle => Children.Count > 1 ? Children[1] : null;\n    public Node Right => Children.Count > 2 ? Children[2] : null;' : ''}

    public Node(int value, List<Node> children = null) {
        Value = value;
        Children = children ?? new List<Node>();
    }
}

class Program {
    static void Main() {
        Node root = ${serializedTree};
        string mode = "${traversal.toUpperCase()}";
        
        if (mode == "PREORDER") PreOrder(root);
        else if (mode == "INORDER") InOrder(root);
        else if (mode == "POSTORDER") PostOrder(root);
    }
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
            footer: `}`
        }
    };

    const t = templates[lang];
    let code = t.setup + "\n";
    
    for (const [mName, mBody] of Object.entries(t.methods)) {
        if (focusMode && mName !== traversal) {
            // Check if binary constraint applies
            if (mName === 'inorder' && !isBinary) continue;
            
            // Collapsed version
            if (lang === 'js') code += `function ${mName}(node) { /* ... */ }\n`;
            else if (lang === 'python') code += `def ${mName}(node): pass # ...\n`;
            else if (lang === 'csharp') code += `    static void ${mName.charAt(0).toUpperCase() + mName.slice(1)}(Node node) { /* ... */ }\n`;
        } else {
            if (mName === 'inorder' && !isBinary) continue;
            code += mBody + "\n";
        }
    }
    
    code += t.footer;
    return code;
}

function serializeTree(tree, lang, maxChildren) {
    if (!tree.root) return lang === 'python' ? 'None' : 'null';
    
    const serializeNode = (node) => {
        const childStrs = node.children.map(c => serializeNode(c));
        if (lang === 'js') {
            return `new Node(${node.value}, [${childStrs.join(', ')}])`;
        } else if (lang === 'python') {
            return `Node(${node.value}, [${childStrs.join(', ')}])`;
        } else if (lang === 'csharp') {
            return `new Node(${node.value}, new List<Node> { ${childStrs.join(', ')} })`;
        }
        return "";
    };

    return serializeNode(tree.root);
}
