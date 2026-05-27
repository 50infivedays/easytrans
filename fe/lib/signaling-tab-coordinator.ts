'use client';

/** Cross-tab WebSocket leader election (one signaling connection per browser). */

const CHANNEL_NAME = 'webdrop-signaling-v1';
const TAB_ID_KEY = 'webdrop-tab-id';

export type TabCoordinatorEvent =
  | { type: 'became-leader' }
  | { type: 'resigned-leader' }
  | { type: 'leader-changed' }
  | { type: 'ws-send'; payload: string }
  | { type: 'ws-message'; payload: string }
  | { type: 'ws-state'; uid: string | null; connected: boolean; sessionId: string };

type ChannelMessage =
  | { type: 'claim'; tabId: string; at: number }
  | { type: 'resign'; tabId: string }
  | { type: 'ws-send'; tabId: string; payload: string }
  | { type: 'ws-message'; payload: string }
  | { type: 'ws-state'; uid: string | null; connected: boolean; sessionId: string };

function getTabId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem(TAB_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(TAB_ID_KEY, id);
  }
  return id;
}

export class SignalingTabCoordinator {
  private static instance: SignalingTabCoordinator | null = null;

  readonly tabId: string;
  private channel: BroadcastChannel | null = null;
  private leaderTabId: string | null = null;
  private listeners = new Set<(event: TabCoordinatorEvent) => void>();
  private claimTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.tabId = getTabId();
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<ChannelMessage>) => {
        this.handleChannelMessage(event.data);
      };
    }
  }

  static getInstance(): SignalingTabCoordinator {
    if (!SignalingTabCoordinator.instance) {
      SignalingTabCoordinator.instance = new SignalingTabCoordinator();
    }
    return SignalingTabCoordinator.instance;
  }

  subscribe(listener: (event: TabCoordinatorEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isLeader(): boolean {
    return this.leaderTabId === this.tabId;
  }

  getLeaderTabId(): string | null {
    return this.leaderTabId;
  }

  /** Call when this tab should own the WebSocket (focus / visible). */
  requestLeadership(): void {
    if (!this.channel) {
      this.leaderTabId = this.tabId;
      this.emit({ type: 'became-leader' });
      return;
    }

    this.post({ type: 'claim', tabId: this.tabId, at: Date.now() });

    if (this.claimTimer) clearTimeout(this.claimTimer);
    this.claimTimer = setTimeout(() => {
      this.claimTimer = null;
      if (this.leaderTabId !== this.tabId) {
        this.leaderTabId = this.tabId;
        this.emit({ type: 'became-leader' });
      }
    }, 60);
  }

  /** Release leadership when tab is hidden (optional). */
  releaseLeadership(): void {
    if (!this.isLeader()) return;
    this.leaderTabId = null;
    this.post({ type: 'resign', tabId: this.tabId });
    this.emit({ type: 'resigned-leader' });
  }

  sendToLeader(payload: string): void {
    if (this.isLeader()) return;
    this.post({ type: 'ws-send', tabId: this.tabId, payload });
  }

  broadcastFromLeader(message: ChannelMessage): void {
    if (!this.isLeader()) return;
    this.post(message);
  }

  private post(message: ChannelMessage): void {
    this.channel?.postMessage(message);
  }

  private emit(event: TabCoordinatorEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private handleChannelMessage(message: ChannelMessage): void {
    switch (message.type) {
      case 'claim': {
        if (message.tabId === this.tabId) return;
        if (this.isLeader()) {
          this.leaderTabId = null;
          this.emit({ type: 'resigned-leader' });
        }
        this.leaderTabId = message.tabId;
        this.emit({ type: 'leader-changed' });
        break;
      }
      case 'resign': {
        if (this.leaderTabId === message.tabId) {
          this.leaderTabId = null;
          this.emit({ type: 'leader-changed' });
          if (document.visibilityState === 'visible' && document.hasFocus()) {
            this.requestLeadership();
          }
        }
        break;
      }
      case 'ws-send': {
        if (this.isLeader()) {
          this.emit({ type: 'ws-send', payload: message.payload });
        }
        break;
      }
      case 'ws-message': {
        this.emit({ type: 'ws-message', payload: message.payload });
        break;
      }
      case 'ws-state': {
        this.emit({
          type: 'ws-state',
          uid: message.uid,
          connected: message.connected,
          sessionId: message.sessionId,
        });
        break;
      }
      default:
        break;
    }
  }

  attachVisibilityHandlers(): () => void {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        this.requestLeadership();
      } else {
        this.releaseLeadership();
      }
    };

    const onFocus = () => this.requestLeadership();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    if (document.visibilityState === 'visible') {
      this.requestLeadership();
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      if (this.isLeader()) this.releaseLeadership();
    };
  }
}

export function createSessionId(): string {
  return crypto.randomUUID();
}
