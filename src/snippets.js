export function getSnippets(lang, traversal, maxChildren) {
    const isBinary = maxChildren <= 2;
    const isTernary = maxChildren === 3;
    
    const snippets = {
        js: {
            preorder: isBinary 
                ? `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  preorder(node.left);\n  preorder(node.right);\n}`
                : isTernary
                ? `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  preorder(node.left);\n  preorder(node.middle);\n  preorder(node.right);\n}`
                : `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  for (let child of node.children) {\n    preorder(child);\n  }\n}`,
            inorder: `function inorder(node) {\n  if (!node) return;\n  inorder(node.left);\n  console.log(node.value);\n  inorder(node.right);\n}`, // Only used when maxChildren <= 2
            postorder: isBinary
                ? `function postorder(node) {\n  if (!node) return;\n  postorder(node.left);\n  postorder(node.right);\n  console.log(node.value);\n}`
                : isTernary
                ? `function postorder(node) {\n  if (!node) return;\n  postorder(node.left);\n  postorder(node.middle);\n  postorder(node.right);\n  console.log(node.value);\n}`
                : `function postorder(node) {\n  if (!node) return;\n  for (let child of node.children) {\n    postorder(child);\n  }\n  console.log(node.value);\n}`
        },
        python: {
            preorder: isBinary
                ? `def preorder(node):\n    if not node: return\n    print(node.value)\n    preorder(node.left)\n    preorder(node.right)`
                : isTernary
                ? `def preorder(node):\n    if not node: return\n    print(node.value)\n    preorder(node.left)\n    preorder(node.middle)\n    preorder(node.right)`
                : `def preorder(node):\n    if not node: return\n    print(node.value)\n    for child in node.children:\n        preorder(child)`,
            inorder: `def inorder(node):\n    if not node: return\n    inorder(node.left)\n    print(node.value)\n    inorder(node.right)`, // Only used when maxChildren <= 2
            postorder: isBinary
                ? `def postorder(node):\n    if not node: return\n    postorder(node.left)\n    postorder(node.right)\n    print(node.value)`
                : isTernary
                ? `def postorder(node):\n    if not node: return\n    postorder(node.left)\n    postorder(node.middle)\n    postorder(node.right)\n    print(node.value)`
                : `def postorder(node):\n    if not node: return\n    for child in node.children:\n        postorder(child)\n    print(node.value)`
        },
        csharp: {
            preorder: isBinary
                ? `void PreOrder(Node node) {\n    if (node == null) return;\n    Console.WriteLine(node.Value);\n    PreOrder(node.Left);\n    PreOrder(node.Right);\n}`
                : isTernary
                ? `void PreOrder(Node node) {\n    if (node == null) return;\n    Console.WriteLine(node.Value);\n    PreOrder(node.Left);\n    PreOrder(node.Middle);\n    PreOrder(node.Right);\n}`
                : `void PreOrder(Node node) {\n    if (node == null) return;\n    Console.WriteLine(node.Value);\n    foreach (var child in node.Children) {\n        PreOrder(child);\n    }\n}`,
            inorder: `void InOrder(Node node) {\n    if (node == null) return;\n    InOrder(node.Left);\n    Console.WriteLine(node.Value);\n    InOrder(node.Right);\n}`, // Only used when maxChildren <= 2
            postorder: isBinary
                ? `void PostOrder(Node node) {\n    if (node == null) return;\n    PostOrder(node.Left);\n    PostOrder(node.Right);\n    Console.WriteLine(node.Value);\n}`
                : isTernary
                ? `void PostOrder(Node node) {\n    if (node == null) return;\n    PostOrder(node.Left);\n    PostOrder(node.Middle);\n    PostOrder(node.Right);\n    Console.WriteLine(node.Value);\n}`
                : `void PostOrder(Node node) {\n    if (node == null) return;\n    foreach (var child in node.Children) {\n        PostOrder(child);\n    }\n    Console.WriteLine(node.Value);\n}`
        }
    };

    return snippets[lang][traversal];
}
