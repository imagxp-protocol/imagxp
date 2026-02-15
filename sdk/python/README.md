# IMAGXP Python SDK (Under Development)

**Status:** 🚧 Work In Progress
**Priority:** Critical (Required for AI Agents)

## Overview
This directory is reserved for the Python implementation of IMAGXP, which will be the primary SDK for **AI Agents** (built on LangChain, LlamaIndex, or Hugging Face).

## Roadmap
1.  Port `IMAGXPAgent` logic from TypeScript to Python.
2.  Implement `ECDSA P-256` signing using `cryptography` library.
3.  Create decorators for Flask/FastAPI/Django (Publisher Middleware).

## Call for Contributors
We are looking for a Python maintainer to lead this SDK.
If you are interested, please open an Issue with the tag `[python-sdk]`.

### Expected Usage
```python
from imagxp import Agent, AccessPurpose

agent = Agent()
header = agent.create_access_request(
    resource="https://example.com",
    purpose=AccessPurpose.RAG_RETRIEVAL
)
```