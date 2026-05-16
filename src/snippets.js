export function getSnippets(lang, traversal, maxChildren) {
    const isBinary = maxChildren <= 2;
    
    const snippets = {
        js: {
            preorder: isBinary 
                ? `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  preorder(node.left);\n  preorder(node.right);\n}`
                : `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  for (let child of node.children) {\n    preorder(child);\n  }\n}`,
            inorder: isBinary
                ? `function inorder(node) {\n  if (!node) return;\n  inorder(node.left);\n  console.log(node.value);\n  inorder(node.right);\n}`
                : `function inorder(node) {\n  if (!node) return;\n  if (node.children[0]) inorder(node.children[0]);\n  console.log(node.value);\n  for (let i = 1; i < node.children.length; i++) {\n    inorder(node.children[i]);\n  }\n}`,
            postorder: isBinary
                ? `function postorder(node) {\n  if (!node) return;\n  postorder(node.left);\n  postorder(node.right);\n  console.log(node.value);\n}`
                : `function postorder(node) {\n  if (!node) return;\n  for (let child of node.children) {\n    postorder(child);\n  }\n  console.log(node.value);\n}`
        },
        python: {
            preorder: isBinary
                ? `def preorder(node):\n    if not node: return\n    print(node.value)\n    preorder(node.left)\n    preorder(node.right)`
                : `def preorder(node):\n    if not node: return\n    print(node.value)\n    for child in node.children:\n        preorder(child)`,
            inorder: isBinary
                ? `def inorder(node):\n    if not node: return\n    inorder(node.left)\n    print(node.value)\n    inorder(node.right)`
                : `def inorder(node):\n    if not node: return\n    if len(node.children) > 0:\n        inorder(node.children[0])\n    print(node.value)\n    for child in node.children[1:]:\n        inorder(child)`,
            postorder: isBinary
                ? `def postorder(node):\n    if not node: return\n    postorder(node.left)\n    postorder(node.right)\n    print(node.value)`
                : `def postorder(node):\n    if not node: return\n    for child in node.children:\n        postorder(child)\n    print(node.value)`
        },
        csharp: {
            preorder: isBinary
                ? `void PreOrder(Node node) {\n    if (node == null) return;\n    Console.WriteLine(node.Value);\n    PreOrder(node.Left);\n    PreOrder(node.Right);\n}`
                : `void PreOrder(Node node) {\n    if (node == null) return;\n    Console.WriteLine(node.Value);\n    foreach (var child in node.Children) {\n        PreOrder(child);\n    }\n}`,
            inorder: isBinary
                ? `void InOrder(Node node) {\n    if (node == null) return;\n    InOrder(node.Left);\n    Console.WriteLine(node.Value);\n    InOrder(node.Right);\n}`
                : `void InOrder(Node node) {\n    if (node == null) return;\n    if (node.Children.Count > 0) InOrder(node.Children[0]);\n    Console.WriteLine(node.Value);\n    for (int i = 1; i < node.Children.Count; i++) {\n        InOrder(node.Children[i]);\n    }\n}`,
            postorder: isBinary
                ? `void PostOrder(Node node) {\n    if (node == null) return;\n    PostOrder(node.Left);\n    PostOrder(node.Right);\n    Console.WriteLine(node.Value);\n}`
                : `void PostOrder(Node node) {\n    if (node == null) return;\n    foreach (var child in node.Children) {\n        PostOrder(child);\n    }\n    Console.WriteLine(node.Value);\n}`
        }
    };

    return snippets[lang][traversal];
}
