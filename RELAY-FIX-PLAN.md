# RELAY FIX PLAN -- Read This First

## Status
The multi-agent relay sync is broken. The Feb 7 code on `craihub/clawgpt` (commit `2e72b99`) works perfectly for single-agent. The task is to add multi-agent UI on top without breaking relay.

## Working Feb 7 Architecture (DO NOT CHANGE)
Phone is a **thin client**. Desktop is the brain.

### Desktop -> Phone (3 channels via chat-update):
1. Streaming deltas: `{chatId, streaming: true, content}` (throttled 100ms)  
2. Final assistant msg: `{chatId, message: assistantMsg}` from `addAssistantMessage`
3. User msg echo: `{chatId, message: userMsg}` from `sendMessage`

### Phone -> Desktop:
1. `chat-update` with `{chatId, message: userMsg}` -- desktop calls `handleChatUpdate`
2. `gateway-request` with `chat.send` -- desktop forwards raw to gateway WS

### Key rules:
- **Gateway responses are NOT forwarded to phone.** Phone gets results ONLY via chat-update.
- Phone's `request('chat.send')` timeout is expected and harmless.
- `handlePhoneMessage` uses `this.sendMessage(content)` which sets streaming=true, adds user msg, and sends to gateway. This is the correct flow.
- `forwardToRelay()` exists but is NEVER called. Dead code.

## What Multi-Agent Needs to Add
1. **agents-config.js** -- defines agents with sessionKeys
2. **Agent sidebar** -- UI to switch between agents (workspaces)
3. **Per-agent chats** -- each agent has its own chat(s) with `agentId` field
4. **Session key switching** -- `this.sessionKey` changes when agent changes
5. **Phone agent switching** -- phone can switch agents independently

## The ChatId Problem
Phone and desktop generate independent chatIds. In single-agent this doesn't matter (only one chat). In multi-agent, phone creates chat `abc`, desktop has chat `xyz` for the same agent. Solutions:

### Option A: Phone always uses desktop's chatId (RECOMMENDED)
- On `full-state`, phone gets desktop's chats with their IDs
- Phone uses those IDs when sending messages
- No divergence possible

### Option B: Desktop maps phone chatIds to its own (current broken approach)
- Requires intercepting and routing -- error-prone, caused all the bugs

## Implementation Plan
1. Start from the Feb 7 `craihub/clawgpt` code (`2e72b99`)
2. Add `agents-config.js` and agent sidebar UI
3. Add `agentId` to chats, `switchAgent()` method
4. Modify `sendFullState()` to include agentId per chat
5. Add `full-state` handler to phone's `handleRelayClientMessage`
6. Phone uses desktop's chatIds after receiving full-state
7. When phone switches agent, send agent-switch message to desktop
8. Desktop switches to match, ensuring sessionKey alignment
9. `handlePhoneMessage` stays simple -- uses `this.sendMessage(content)`
10. Test each step before moving to next

## Files
- Working code: `craihub/clawgpt` commit `2e72b99` (Feb 7)
- Current broken code: `craihub/clawgpt-app` (commits .63-.67 are patches)
- Served from: `/home/ed/.openclaw/workspace/clawgpt/` (python http.server on 8080)
- Android source: `clawgpt-app/android/app/src/main/assets/public/`
- Desktop source: `clawgpt-app/www/`
- Both files MUST be identical (same app.js)

## Critical Rules
- **NEVER push to craihub/clawgpt without Ed's permission**
- **NEVER push to craihub/clawgpt-app without Ed's permission** (builds are OK)
- Copy app.js to `/home/ed/.openclaw/workspace/clawgpt/app.js` after changes
- Background APK builds, don't block on them
