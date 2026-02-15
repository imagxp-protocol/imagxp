
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

### 5. Neutrality Pledges (Critical)
Security vulnerabilities are patched immediately by Maintainers without a public RFC process, to prevent zero-day exploits. Disclosure follows standard Responsible Disclosure norms.

### 2.3 Dispute Resolution
Disputes regarding content quality scoring or bond slashing are handled by the **Arbitration DAO** (Decentralized Autonomous Organization) or a designated sub-committee.
*   **Appeals**: Publishers can appeal a "Low Quality" flag by staking tokens.
*   **Audits**: Random manual audits check if Agents are "over-flagging" (censorship) or Publishers are "under-delivering" (spam).

## 3. Content & Quality Standards
The Steering Committee maintains the **"IMAGXP Quality Definitions"**:
1.  **Human Verified**: Content with cryptographic proof of human authorship (e.g., World ID, Government ID, or reputable employment).
2.  **AI Usage**: Guidelines on acceptable AI-assistance vs. unacceptable "AI Slop".
3.  **Spam Definitions**: Objective criteria for SEO spam, keyword stuffing, and cloaking.

## 4. Economic Governance (The Bond)
*   **Broker Accreditation**: Rules for who can be a trusted Broker (issuing Visas).
*   **Slashing Conditions**: Under what evidence a Publisher's or Agent's reputation bond is destroyed.

IMAGXP pledges to remain:
*   **Platform Neutral**: Works on Vercel, AWS, Cloudflare, Node, Python, Go.
*   **Broker Neutral**: Does not enforce any specific payment provider.
*   **Model Neutral**: Works for LLMs, Search Engines, and Archives equally.
