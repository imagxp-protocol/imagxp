
# Contributing to IMAGXP

Thank you for your interest in the **Identity Monetization Auto Governance Exchange Protocol**. We are building the constitutional layer for the new AI-Web economy.

## 🌟 Quality Standards
IMAGXP is a **security-critical protocol**. Code quality is paramount.
*   **0 Dependencies**: The Core SDK must have zero runtime dependencies (except essential crypto libs like `jose`).
*   **Strict Types**: No `any`. All interfaces must be defined in `types.ts`.
*   **100% Documentation**: Every public method must have JSDoc comments.

## 🛠️ Development Setup

1.  **Fork & Clone**:
    ```bash
    git clone https://github.com/your-username/imagxp-protocol.git
    cd imagxp
    ```
2.  **Install**:
    ```bash
    npm install
    ```
3.  **Build SDK**:
    ```bash
    cd sdk/typescript
    npm run build
    ```

## 🧪 Testing
We require **Code Proof**.
*   **Unit Tests**: Logic verification (signatures, policy changes).
*   **Integration Tests**: Mock Agent <-> Publisher flows.
*   Run tests via:
    ```bash
    npm test
    ```

## 📝 Pull Request Process
1.  **Feature Branch**: Create a branch `feat/your-feature`.
2.  **Commit Messages**: Use Conventional Commits (e.g., `feat: add broker support`, `fix: signature validation`).
3.  **Review**: All PRs require review from a Core Maintainer.

## 🚫 What We Don't Accept
*   "Vibe Code" or generated slop without architectural thought.
*   Changes that break the v1.2 Spec backward compatibility.
*   New dependencies without justification.
