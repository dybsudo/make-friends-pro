import { request } from '../utils/request';

export function createNote(payload) {
	return request({
		url: '/api/notes',
		method: 'POST',
		data: payload
	});
}

export function fetchMyNotes() {
	return request({
		url: '/api/notes/my'
	});
}

export function fetchNoteDetail(id) {
	return request({
		url: `/api/notes/${encodeURIComponent(id || '')}`
	});
}

export function markNoteRepliesRead(replyIds = []) {
	return request({
		url: '/api/notes/replies/read',
		method: 'POST',
		data: { replyIds }
	});
}

export function pickNote() {
	return request({
		url: '/api/notes/pick',
		method: 'POST'
	});
}

export function replyNote(id, payload) {
	return request({
		url: `/api/notes/${id}/replies`,
		method: 'POST',
		data: payload
	});
}

export function reportNote(id, reason) {
	return request({
		url: `/api/notes/${encodeURIComponent(id || '')}/reports`,
		method: 'POST',
		data: { reason }
	});
}
