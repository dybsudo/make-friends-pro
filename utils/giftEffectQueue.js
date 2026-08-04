const STORAGE_KEY = 'thought_pending_gift_effects';
const HANDLED_STORAGE_KEY = 'thought_handled_gift_effects';
const MAX_ITEMS = 30;
const MAX_AGE = 24 * 60 * 60 * 1000;
const MAX_HANDLED_ITEMS = 200;
const MAX_HANDLED_AGE = 7 * 24 * 60 * 60 * 1000;

function getEffectId(data = {}) {
	return String(data.transactionId || (data.message && data.message.id) || '').trim();
}

function readQueue() {
	try {
		const items = uni.getStorageSync(STORAGE_KEY);
		if (!Array.isArray(items)) return [];
		const cutoff = Date.now() - MAX_AGE;
		return items.filter((item) => item && Number(item.queuedAt || 0) >= cutoff);
	} catch (error) {
		return [];
	}
}

function writeQueue(items = []) {
	try {
		uni.setStorageSync(STORAGE_KEY, items.slice(-MAX_ITEMS));
	} catch (error) {}
}

function readHandledEffects() {
	try {
		const items = uni.getStorageSync(HANDLED_STORAGE_KEY);
		if (!Array.isArray(items)) return [];
		const cutoff = Date.now() - MAX_HANDLED_AGE;
		return items.filter((item) => item && item.id && Number(item.handledAt || 0) >= cutoff);
	} catch (error) {
		return [];
	}
}

function writeHandledEffects(items = []) {
	try {
		uni.setStorageSync(HANDLED_STORAGE_KEY, items.slice(-MAX_HANDLED_ITEMS));
	} catch (error) {}
}

export function isGiftEffectHandled(effectId) {
	const id = String(effectId || '').trim();
	return Boolean(id && readHandledEffects().some((item) => item.id === id));
}

export function markGiftEffectHandled(effectId) {
	const id = String(effectId || '').trim();
	if (!id) return;
	const items = readHandledEffects().filter((item) => item.id !== id);
	items.push({ id, handledAt: Date.now() });
	writeHandledEffects(items);
}

export function queueGiftEffect(data = {}) {
	const id = getEffectId(data);
	if (!id || isGiftEffectHandled(id) || !data.conversationId || !data.recipientUserId || !data.gift) return;
	const items = readQueue().filter((item) => item.id !== id);
	items.push({
		id,
		conversationId: data.conversationId,
		recipientUserId: data.recipientUserId,
		gift: data.gift,
		queuedAt: Date.now()
	});
	writeQueue(items);
}

export function takeGiftEffects(conversationId, recipientUserId) {
	if (!conversationId || !recipientUserId) return [];
	const items = readQueue();
	const matched = items.filter((item) => (
		item.conversationId === conversationId && item.recipientUserId === recipientUserId
	));
	if (matched.length) {
		const matchedIds = new Set(matched.map((item) => item.id));
		writeQueue(items.filter((item) => !matchedIds.has(item.id)));
	}
	return matched;
}

export function removeGiftEffect(data = {}) {
	const id = typeof data === 'string' ? data : getEffectId(data);
	if (!id) return;
	const items = readQueue();
	const remaining = items.filter((item) => item.id !== id);
	if (remaining.length !== items.length) writeQueue(remaining);
}
