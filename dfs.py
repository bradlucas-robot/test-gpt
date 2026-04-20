from collections import defaultdict


def dfs_recursive(graph, start):
    visited = set()
    order = []

    def _dfs(node):
        if node in visited:
            return
        visited.add(node)
        order.append(node)
        for neighbor in graph.get(node, []):
            _dfs(neighbor)

    _dfs(start)
    return order


def dfs_iterative(graph, start):
    visited = set()
    order = []
    stack = [start]

    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        # reverse to keep traversal close to recursive order
        for neighbor in reversed(graph.get(node, [])):
            if neighbor not in visited:
                stack.append(neighbor)

    return order


if __name__ == "__main__":
    graph = {
        "A": ["B", "C"],
        "B": ["D", "E"],
        "C": ["F"],
        "D": [],
        "E": ["F"],
        "F": []
    }

    start_node = "A"
    print("Recursive DFS:", dfs_recursive(graph, start_node))
    print("Iterative DFS:", dfs_iterative(graph, start_node))
