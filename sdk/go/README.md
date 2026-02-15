# IMAGXP Go SDK (Under Development)

**Status:** 🚧 Work In Progress
**Priority:** High (Required for High-Performance Crawlers)

## Overview
This directory is reserved for the Go (Golang) implementation of IMAGXP. This is critical for **high-throughput crawlers** and **infrastructure-level middleware**.

## Roadmap
1.  Implement `ProtocolHeader` struct and JSON marshaling.
2.  Implement `crypto/ecdsa` signing and verification utilities.
3.  Create `net/http` middleware for Publishers.

## Call for Contributors
We are looking for a Go maintainer to lead this SDK.
If you are interested, please open an Issue with the tag `[go-sdk]`.

### Expected Usage
```go
import "github.com/imagxp-protocol/imagxp/sdk/go"

func main() {
    agent := imagxp.NewAgent()
    req, _ := agent.CreateAccessRequest("https://example.com", imagxp.PurposeRAG)
}
```