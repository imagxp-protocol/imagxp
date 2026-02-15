
# IMAGXP Protocol Governance

This document outlines how the **Identity Monetization Auto Governance Exchange Protocol** is managed, maintained, and evolved.

## 1. Project Roles

### 1.1 Maintainers
Maintainers are responsible for the core repository, security patches, and SDK releases. They have merge access to `main` and NPM write access.

### 1.2 Steering Committee
A group of stakeholders (representing Publishers, Agents, and Brokers) who vote on future Spec revisions (v1.3, etc). They ensure the protocol remains neutral and does not favor one party unfairly.

### 1.3 Contributors
Community developers who submit PRs, Issues, or RFCs (Requests for Comments).

## 2. Decision Making Process

### 2.1 RFC Process (Major Changes)
For any change that alters the Protocol Specification (breaking changes or new headers):
1.  **Draft**: Submit an RFC markdown file to `rfcs/`.
2.  **Discussion**: 30-day comment period on GitHub Discussions.
3.  **Vote**: Steering Committee votes. Simple majority wins.

### 2.2 Security Patches (Critical)
Security vulnerabilities are patched immediately by Maintainers without a public RFC process, to prevent zero-day exploits. Disclosure follows standard Responsible Disclosure norms.

## 3. Neutrality Pledge
IMAGXP pledges to remain:
*   **Platform Neutral**: Works on Vercel, AWS, Cloudflare, Node, Python, Go.
*   **Broker Neutral**: Does not enforce any specific payment provider.
*   **Model Neutral**: Works for LLMs, Search Engines, and Archives equally.
