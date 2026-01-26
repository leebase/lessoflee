---
title: 'AI Code Review Example'
description: 'After having Claude Code build a sql 2 json python app for me, I had Codex Cloud do a code review'
pubDatetime: 2026-01-22T00:00:00Z
tags:
  - homelab
  - GenAI
---
# SQL-to-JSON Export – Code & Docs Review  
*A concise, attractive summary of what was found and what to do next.*

---

## 1. Executive Summary
| Aspect | Verdict |
|--------|---------|
| **Functionality** | Works for small result sets, but **not production-ready** for large data or strict security. |
| **Maintainability** | Three near-identical copies of core logic = 3× the bugs. |
| **Security** | Passwords leak to shell history; TLS checks disabled by default. |
| **Docs vs. Reality** | “Optional chunked JSON writing” is mentioned, but nowhere implemented. |

---

## 2. Hot-Spots & Fixes

| Hot-spot | Why it Hurts | Quick-win | Future-proof |
|----------|--------------|-----------|--------------|
| **Memory Hungry** | `fetchall()` keeps entire result in RAM → swap-thrashing on big tables. | Add `--stream` flag that uses `fetchmany(size=…)` and yields JSON rows incrementally. | Offer back-pressure (pause socket) when downstream consumer is slow. |
| **Decimal → Float** | `1.00000000000000000000000000001` silently becomes `1.0`. | Default to `str(decimal_obj)`; add `--numeric-mode float\|string\|decimal`. | Accept `json.dumps(parse_float=Decimal)` if consumer needs math. |
| **Cursor.description == None** | `INSERT…` crashes with `TypeError`. | Early-exit with clear message: *“Query returns no columns, nothing to export.”* | Allow `--affected-rows` flag to emit `{"rows_affected": 42}` for non-SELECT. |
| **Triplicated Code** | Three files repeat connection-string builder & serializer. | Move to `sql_to_json_core.py`; expose `build_connstr(), rows_to_json()` | Publish package on PyPI → single source of truth. |
| **CLI Password Leak** | `ps aux` shows `--password SuperSecret123`. | Support `SQL_PASSWORD` env-var or `getpass.getpass()` prompt. | Integrate with `keyring` lib for desktop users. |
| **TrustServerCertificate** | Driver 18 disables TLS validation → MITM risk. | Flip default to `no`; add `--trust-cert` opt-in with loud warning. | Auto-detect trusted cert in Windows cert store. |
| **Trusted_Connection on macOS/Linux** | Fails cryptically. | Detect OS; if not Windows, show hint: *“Use `--authentication=ActiveDirectoryPassword` instead.”* | Support Kerberos / AAD interactive flow. |

---

## 3. Documentation Mismatch Cheat-Sheet
| Doc Claim | Status | Action |
|-----------|--------|--------|
| *“Optional chunked JSON writing”* | ❌ Not implemented | Remove or implement streaming. |
| *“Binary values are handled”* | ✅ But not documented | Add: *“Binary → base64-encoded string”* |
| *“Decimal precision preserved”* | ❌ Lost via float cast | Warn user in README. |

---

## 4. Suggested Next Sprint
1. **Consolidate** – create `sql_to_json_core.py` and unit-test it once.  
2. **Secure defaults** – `--trust-cert=false`, read password from env.  
3. **Stream** – add `--stream --chunk-size 10000` for big data.  
4. **Release** – tag `v1.1.0` with new flags; update README screencast.

---

## 5. One-liner Take-away
*Great PoC, but before it hits prod: stream the rows, lock down the certs, and DRY-out the triplicated code.*