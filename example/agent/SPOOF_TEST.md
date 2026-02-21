# 🕵️ How to Test Identity Spoofing

This guide explains how to simulate a "Fake Agent" attack to verify that the Publisher's security (DNS Binding) is working.

## The Experiment
We will make your Agent **claim** to be `google.com` (or any domain you don't own). Since you cannot host the `imagxp-agent.json` file on `google.com`, the verification should FAIL.

## Steps

1.  **Open Agent Environment**
    Go to `example/agent/.env`.

2.  **Change Identity to a Fake Domain**
    Modify `IMAGXP_AGENT_ID` to a domain you do not control.
    ```ini
    # .env
    # IMAGXP_AGENT_ID="agentside.vercel.app"  <-- REAL (Matches your key)
    IMAGXP_AGENT_ID="google.com"              <-- FAKE (Spoofing)
    ```

3.  **Restart & Run**
    *   Restart the Agent (`npm run dev` or redeploy).
    *   Try to search for a URL (e.g., your Publisher URL).

## Expected Result

### 1. The Publisher Logs (Vercel/Terminal)
The Publisher will look up `google.com/.well-known/imagxp-agent.json`.
*   It will either **fail to find it** (404).
*   OR, if it finds it, the **Public Key won't match** yours.

You should see a log like this:
```
[IDENTITY] 🔍 Verifying DNS Binding for: google.com
[DNS] ❌ Fetch Failed or Key Mismatch
[IDENTITY] ❌ FAILED. Reason: IDENTITY_FAIL: DNS Binding could not be verified.
```

### 2. The Agent UI
*   If `strategy: 'HYBRID'` is ON (default): You might still get access as a "Guest" (Browser fallback), but you won't be a "Verified Agent".
*   If you set `strategy: 'STRICT'` in Publisher: You will get an **Access Denied** error.

## Why this happens
This proves **DNS Binding** works. You cannot just "say" you are `google.com`; you must prove it by controlling the files on that domain.
