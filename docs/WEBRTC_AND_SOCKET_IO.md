# HireSprint WebRTC & Socket.IO Architecture

## Overview
HireSprint uses a peer-to-peer (P2P) WebRTC mesh topology coordinated by an authenticated Socket.IO signaling layer for real-time video, audio, and meeting state synchronization.

## Signaling Protocol

All signaling events are strictly authenticated via JWT and validated server-side to ensure that clients only communicate within authorized rooms.

```mermaid
sequenceDiagram
    participant Alice as Student A (Client)
    participant Server as Socket.IO Signaling Server
    participant Bob as Student B (Client)

    Alice->>Server: meeting:join { roomId, token }
    Server->>Server: Authenticate JWT & Authorize Room
    Server->>Bob: meeting:participant-joined { peerId: Alice }
    Server->>Alice: meeting:state { participants, roomDetails }

    Alice->>Alice: Create RTCPeerConnection & Offer
    Alice->>Server: webrtc:offer { target: Bob, offer }
    Server->>Bob: webrtc:offer { from: Alice, offer }

    Bob->>Bob: Set Remote Description & Create Answer
    Bob->>Server: webrtc:answer { target: Alice, answer }
    Server->>Alice: webrtc:answer { from: Bob, answer }

    Alice->>Server: webrtc:ice-candidate { target: Bob, candidate }
    Server->>Bob: webrtc:ice-candidate { from: Alice, candidate }
    Bob->>Server: webrtc:ice-candidate { target: Alice, candidate }
    Server->>Alice: webrtc:ice-candidate { from: Bob, candidate }

    Note over Alice,Bob: Direct P2P Media Streams Established (Audio/Video)
```

## Mesh Architecture vs. SFU
- **Current Mesh Topology**: For university GDs (typically 4–8 students), WebRTC mesh provides ultra-low latency without requiring complex media server hosting.
- **Future SFU Compatibility**: The signaling abstraction separates media control from meeting state, allowing seamless drop-in replacement with an SFU (e.g., LiveKit / Mediasoup) when larger cohorts (>10 students per room) are required.

## Live Meeting Features
- Waiting room with audio/video device preview
- Microphone mute / unmute
- Camera enable / disable
- Raise hand indicator
- Real-time in-meeting chat
- Real-time speech transcription stream
- Real-time AI Moderator interventions
- Participant leave and disconnection cleanup
- Automatic attendance logging
