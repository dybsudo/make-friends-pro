const STORAGE_KEY = 'thought-chat-outbox-v1';

function readItems() {
	try {
		const items = uni.getStorageSync(STORAGE_KEY);
		return Array.isArray(items) ? items : [];
	} catch (error) {
		return [];
	}
}

function writeItems(items) {
	try {
		uni.setStorageSync(STORAGE_KEY, items.slice(-100));
	} catch (error) {}
}

export function listOutboxMessages(conversationId) {
	return readItems().filter((item) => item.conversationId === conversationId);
}

export function saveOutboxMessage(item = {}) {
	if (!item.id || !item.conversationId || !item.payload) return;
	const items = readItems().filter((existing) => existing.id !== item.id);
	items.push(item);
	writeItems(items);
}

export function removeOutboxMessage(id) {
	if (!id) return;
	writeItems(readItems().filter((item) => item.id !== id));
}
