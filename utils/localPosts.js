import { DEFAULT_AVATAR_URL } from '../config';
import { getCurrentUser } from './auth';

const STORAGE_KEY = 'thought-local-posts-v1';
const MAX_POSTS = 100;

function readStoredPosts() {
	try {
		const value = uni.getStorageSync(STORAGE_KEY);
		return Array.isArray(value) ? value.filter((item) => item && item.id) : [];
	} catch (error) {
		return [];
	}
}

function saveImage(filePath) {
	if (!filePath || typeof uni.saveFile !== 'function') {
		return Promise.resolve(filePath || '');
	}

	return new Promise((resolve) => {
		uni.saveFile({
			tempFilePath: filePath,
			success: (result) => resolve(result.savedFilePath || filePath),
			fail: () => resolve(filePath)
		});
	});
}

async function persistImages(images = []) {
	const paths = images
		.map((item) => (typeof item === 'string' ? item : item && item.url))
		.filter(Boolean);
	const savedPaths = [];

	for (const filePath of paths) {
		savedPaths.push(await saveImage(filePath));
	}

	return savedPaths;
}

export function getLocalPosts() {
	return readStoredPosts().sort((a, b) => (
		new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
	));
}

export async function createLocalPost(payload = {}) {
	const user = getCurrentUser() || {};
	const now = new Date().toISOString();
	const post = {
		id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		content: String(payload.content || '').trim(),
		images: await persistImages(payload.images),
		tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean).slice(0, 3) : [],
		createdAt: now,
		author: {
			name: user.nickname || user.name || '我',
			avatar: user.avatarUrl || user.avatar || DEFAULT_AVATAR_URL,
			gender: user.gender || '',
			age: Number(user.age || 0),
			city: user.city || ''
		},
		likes: 0,
		comments: 0,
		favorites: 0
	};

	const posts = [post, ...readStoredPosts()].slice(0, MAX_POSTS);
	uni.setStorageSync(STORAGE_KEY, posts);
	return post;
}
