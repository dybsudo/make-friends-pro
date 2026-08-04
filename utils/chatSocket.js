import { WS_BASE_URL } from '../config/index';
import { clearSession, ensureSession, getAuthToken } from './auth';

const HEARTBEAT_INTERVAL = 25000;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000, 30000];

let socketTask = null;
let socketState = 'closed';
let shouldConnect = false;
let reconnectAttempts = 0;
let reconnectTimer = null;
let heartbeatTimer = null;
const listeners = new Set();
const onlineUserIds = new Set();

function replaceOnlineUsers(userIds = []) {
	onlineUserIds.clear();
	userIds.forEach((userId) => {
		if (userId) onlineUserIds.add(userId);
	});
}

function emit(event) {
	listeners.forEach((listener) => {
		try {
			listener(event);
		} catch (error) {}
	});
}

function clearReconnectTimer() {
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
}

function stopHeartbeat() {
	if (heartbeatTimer) {
		clearInterval(heartbeatTimer);
		heartbeatTimer = null;
	}
}

function send(payload) {
	if (!socketTask || socketState !== 'open') return;
	const activeSocket = socketTask;
	socketTask.send({
		data: JSON.stringify(payload),
		fail: () => {
			if (socketTask !== activeSocket) return;
			socketTask = null;
			socketState = 'closed';
			stopHeartbeat();
			try {
				activeSocket.close({ code: 1000, reason: 'Send failed' });
			} catch (error) {}
			scheduleReconnect();
		}
	});
}

export function sendChatSocketEvent(type, data = {}) {
	if (!type) return;
	send({ type, data });
}

function startHeartbeat() {
	stopHeartbeat();
	heartbeatTimer = setInterval(() => {
		send({ type: 'ping', sentAt: new Date().toISOString() });
	}, HEARTBEAT_INTERVAL);
}

function scheduleReconnect() {
	if (!shouldConnect || reconnectTimer || socketState === 'connecting') return;
	stopHeartbeat();
	socketState = 'closed';
	const delay = RECONNECT_DELAYS[Math.min(reconnectAttempts, RECONNECT_DELAYS.length - 1)];
	reconnectAttempts += 1;
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		openSocket();
	}, delay);
}

async function openSocket() {
	if (!shouldConnect || socketState === 'connecting' || socketState === 'open') return;
	socketState = 'connecting';

	try {
		await ensureSession();
		if (!shouldConnect) {
			socketState = 'closed';
			return;
		}

		const activeSocket = uni.connectSocket({
			url: `${WS_BASE_URL}/ws`,
			complete: () => {}
		});
		socketTask = activeSocket;

		activeSocket.onOpen(() => {
			if (socketTask !== activeSocket) return;
			socketState = 'open';
			send({ type: 'auth', token: getAuthToken() });
		});

		activeSocket.onMessage((result = {}) => {
			if (socketTask !== activeSocket) return;
			let event;
			try {
				event = JSON.parse(result.data);
			} catch (error) {
				return;
			}

			if (event.type === 'ready') {
				reconnectAttempts = 0;
				replaceOnlineUsers((event.data && event.data.onlineUserIds) || []);
				startHeartbeat();
			}

			if (event.type === 'presence.snapshot') {
				replaceOnlineUsers((event.data && event.data.onlineUserIds) || []);
			}

			if (event.type === 'presence.changed' && event.data && event.data.userId) {
				if (event.data.online) onlineUserIds.add(event.data.userId);
				else onlineUserIds.delete(event.data.userId);
			}

			if (event.type !== 'pong') {
				emit(event);
			}
		});

		activeSocket.onClose((event = {}) => {
			if (socketTask !== activeSocket) return;
			socketTask = null;
			socketState = 'closed';
			stopHeartbeat();
			if (Number(event.code) === 4401) {
				clearSession();
			}
			if (Number(event.code) === 4403) {
				shouldConnect = false;
				clearReconnectTimer();
				return;
			}
			scheduleReconnect();
		});

		activeSocket.onError(() => {
			if (socketTask !== activeSocket) return;
			socketTask = null;
			socketState = 'closed';
			stopHeartbeat();
			try {
				activeSocket.close({ code: 1000, reason: 'Connection error' });
			} catch (error) {}
			scheduleReconnect();
		});
	} catch (error) {
		socketState = 'closed';
		scheduleReconnect();
	}
}

export function connectChatSocket() {
	shouldConnect = true;
	clearReconnectTimer();
	openSocket();
}

export function disconnectChatSocket() {
	shouldConnect = false;
	clearReconnectTimer();
	stopHeartbeat();
	reconnectAttempts = 0;
	onlineUserIds.clear();
	const activeSocket = socketTask;
	socketTask = null;
	socketState = 'closed';
	if (activeSocket) {
		try {
			activeSocket.close({ code: 1000, reason: 'App hidden' });
		} catch (error) {}
	}
}

export function subscribeChatEvents(listener) {
	if (typeof listener !== 'function') return () => {};
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function isChatUserOnline(userId) {
	return Boolean(userId && onlineUserIds.has(userId));
}
