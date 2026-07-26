# Graph Report - .  (2026-07-26)

## Corpus Check
- Corpus is ~4,102 words - fits in a single context window. You may not need a graph.

## Summary
- 38 nodes · 38 edges · 9 communities (5 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Main Server Application
- Package Metadata
- JWT Authentication
- NPM Scripts
- bcrypt Dependency
- dotenv Dependency
- express Dependency
- jsonwebtoken Dependency
- nodemon Dependency

## God Nodes (most connected - your core abstractions)
1. `scripts` - 4 edges
2. `tokenBlacklist` - 2 edges
3. `authenticateToken()` - 2 edges
4. `bcryptjs` - 2 edges
5. `dotenv` - 2 edges
6. `express` - 2 edges
7. `jsonwebtoken` - 2 edges
8. `nodemon` - 2 edges
9. `jwt` - 1 edges
10. `main` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (9 total, 4 thin omitted)

### Community 0 - "Main Server Application"
Cohesion: 0.18
Nodes (7): app, { authenticateToken, tokenBlacklist }, bcrypt, dotenv, express, jwt, users

### Community 1 - "Package Metadata"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 2 - "JWT Authentication"
Cohesion: 0.50
Nodes (3): authenticateToken(), jwt, tokenBlacklist

### Community 3 - "NPM Scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 4 - "bcrypt Dependency"
Cohesion: 0.67
Nodes (3): bcryptjs, dependencies, bcryptjs

## Knowledge Gaps
- **23 isolated node(s):** `jwt`, `name`, `version`, `description`, `main` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `bcrypt Dependency` to `Package Metadata`, `dotenv Dependency`, `express Dependency`, `jsonwebtoken Dependency`, `nodemon Dependency`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **Why does `scripts` connect `NPM Scripts` to `Package Metadata`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **What connects `jwt`, `name`, `version` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._