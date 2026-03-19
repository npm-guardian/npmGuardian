use petgraph::graph::{NodeIndex, DiGraph};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct DependencyNode {
    pub name: String,
    pub version: String,
    pub computed_risk_score: u32,
}

pub struct DependencyGraph {
    pub graph: DiGraph<DependencyNode, ()>,
    pub node_indices: HashMap<String, NodeIndex>,
}

impl DependencyGraph {
    pub fn new() -> Self {
        Self {
            graph: DiGraph::new(),
            node_indices: HashMap::new(),
        }
    }

    pub fn add_dependency(&mut self, name: &str, version: &str, score: u32) -> NodeIndex {
        let key = format!("{}@{}", name, version);
        if let Some(&index) = self.node_indices.get(&key) {
            return index;
        }

        let node = DependencyNode {
            name: name.to_string(),
            version: version.to_string(),
            computed_risk_score: score,
        };
        let index = self.graph.add_node(node);
        self.node_indices.insert(key, index);
        index
    }

    pub fn add_link(&mut self, source: NodeIndex, target: NodeIndex) {
        self.graph.add_edge(source, target, ());
    }

    /// Evaluates the entire graph. If a deep dependency is highly risky,
    /// it bubbles up the risk to the parent nodes.
    pub fn bubble_up_risk(&mut self) -> u32 {
        let mut max_risk = 0;
        
        // Very simplified: iterate all nodes and find the max.
        // In reality, this would be a DFS/BFS to trace risk propagation vectors.
        for node in self.graph.node_weights() {
            if node.computed_risk_score > max_risk {
                max_risk = node.computed_risk_score;
            }
        }
        max_risk
    }
}
