export function getSnippets(lang, traversal) {
    const snippets = {
        js: {
            preorder: `function preorder(node) {\n  if (!node) return;\n  console.log(node.value);\n  preorder(node.left);\n  preorder(node.right);\n}`,
            inorder: `function inorder(node) {\n  if (!node) return;\n  inorder(node.left);\n  console.log(node.value);\n  inorder(node.right);\n}`,
            postorder: `function postorder(node) {\n  if (!node) return;\n  postorder(node.left);\n  postorder(node.right);\n  console.log(node.value);\n}`
        },
        python: {
            preorder: `def preorder(node):\n    if not node: return\n    print(node.value)\n    preorder(node.left)\n    preorder(node.right)`,
            inorder: `def inorder(node):\n    if not node: return\n    inorder(node.left)\n    print(node.value)\n    inorder(node.right)`,
            postorder: `def postorder(node):\n    if not node: return\n    postorder(node.left)\n    postorder(node.right)\n    print(node.value)`
        },
        csharp: {
            preorder: `void PreOrder(Node node) {\n    if (node == null) return;\n    Console.WriteLine(node.Value);\n    PreOrder(node.Left);\n    PreOrder(node.Right);\n}`,
            inorder: `void InOrder(Node node) {\n    if (node == null) return;\n    InOrder(node.Left);\n    Console.WriteLine(node.Value);\n    InOrder(node.Right);\n}`,
            postorder: `void PostOrder(Node node) {\n    if (node == null) return;\n    PostOrder(node.Left);\n    PostOrder(node.Right);\n    Console.WriteLine(node.Value);\n}`
        }
    };

    return snippets[lang][traversal];
}
