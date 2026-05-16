# Tree Traversal Educational Tool - Design Specification

## Overview
An interactive web-based educational tool designed for AQA A-Level Computer Science students to visualize and understand tree traversals (Pre-order, In-order, Post-order) and Binary Search Tree (BST) concepts.

## Target Audience
- A-Level Computer Science students (specifically AQA syllabus).
- Computer Science educators.
- Self-learners exploring data structures.

## Core Features

### 1. Interactive Tree Visualization
- **Canvas**: A responsive SVG area displaying a rooted binary tree.
- **Node Representation**: Circular nodes with labels (numeric or alphabetic).
- **Edge Representation**: Clean lines connecting parent and child nodes.
- **Explorer Animation**: A glowing pulse that moves along the tree's perimeter and edges to represent the traversal path.
- **Trace Line**: A toggleable dotted path showing the "outline" of the tree, matching the visual trace method used in exams.

### 2. Traversal Modes
- **Pre-order (Root, Left, Right)**: Visit node on the left side of the trace.
- **In-order (Left, Root, Right)**: Visit node at the bottom of the trace.
- **Post-order (Left, Right, Root)**: Visit node on the right side of the trace.
- **BST Validation**: A mode where the tree follows the Binary Search Tree rule: `Left Child < Parent < Right Child`.

### 3. Logic & State Visualization
- **Animated Call Stack**: A vertical list of cards showing active recursive function calls (e.g., `traverse(A)`).
- **Code Snippet Panel**:
  - Languages: Javascript, Python, C#.
  - Real-time highlighting of the line being executed.
- **Result Sequence**: A list of visited nodes that grows at the bottom of the screen as the traversal progresses.

### 4. Configuration & Toggles
- **Tree Generator**: Sliders for `Min/Max Depth` and `Max Children`.
- **Visibility Toggles**:
  - `Show Trace Line`
  - `Show Call Stack`
  - `Show Code Snippet`
  - `Highlight Leaves/Root`
- **Playback Controls**: Play, Pause, Speed Slider.

## Technical Stack
- **Structure**: Semantic HTML5.
- **Logic**: Vanilla Javascript (ES6+).
- **Styling**: CSS with Glassmorphism aesthetics and CSS Variables for easy theming.
- **Visualization**: SVG for the tree structure.

## Layout Structure
- **Header**: Title and link to GitHub Pages repo.
- **Left Sidebar**: Controls for tree generation and traversal selection.
- **Main Content**: Central Tree SVG Canvas.
- **Right Sidebar**: Insight panels (Code, Stack, Glossary) with toggle switches.
- **Footer**: Result sequence strip.

## Glossary Terms to Illustrate
- **Tree**: Connected, undirected graph with no cycles.
- **Rooted Tree**: One node designated as the root.
- **Binary Tree**: Max 2 children per node.
- **Leaf**: Node with no children.
- **Parent/Child**: Directional relationship between connected nodes.
- **BST Rule**: Specific ordering for storage/search efficiency.
