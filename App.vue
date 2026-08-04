<script>
import { ensureSession, getCurrentUser } from './utils/auth';
import { markMessageDelivered } from './api/message';
import { connectChatSocket, disconnectChatSocket, subscribeChatEvents } from './utils/chatSocket';
import { queueGiftEffect } from './utils/giftEffectQueue';
import {
	getAppMode,
	goCommunityHome,
	guardCurrentPage,
	isFullMode,
	loadAppMode,
	syncTabBarVisibility
} from './utils/appMode';

let realtimeUnsubscribe = null;

async function syncRuntimeMode(force = false) {
	const previousMode = getAppMode();
	await loadAppMode({ force });
	syncTabBarVisibility();
	if (previousMode && previousMode !== getAppMode()) {
		if (!isFullMode()) {
			goCommunityHome({ immediate: true, toast: false });
		} else {
			uni.switchTab({ url: '/pages/meet/index' });
		}
	}
	if (!isFullMode()) {
		disconnectChatSocket();
		await guardCurrentPage();
		return;
	}

	await ensureSession();
	connectChatSocket();
}

export default {
	onLaunch() {
		realtimeUnsubscribe = subscribeChatEvents((event) => {
			if (event.type === 'gift.sent') {
				const data = event.data || {};
				const currentUserId = (getCurrentUser() || {}).id;
				if (currentUserId && data.recipientUserId === currentUserId) queueGiftEffect(data);
				return;
			}
			if (event.type !== 'message.created') return;
			const data = event.data || {};
			const message = data.message || {};
			if (message.mine || !message.id || !message.conversationId) return;
			markMessageDelivered(message.conversationId, message.id).catch(() => {});
		});
		syncRuntimeMode().catch(() => disconnectChatSocket());
	},
	onShow() {
		syncRuntimeMode(true).catch(() => disconnectChatSocket());
	},
	onHide() {
		disconnectChatSocket();
	},
	onUnload() {
		if (realtimeUnsubscribe) realtimeUnsubscribe();
		realtimeUnsubscribe = null;
	}
};
</script>

<style lang="scss">
page {
	background: $thought-bg;
	color: $thought-text;
	font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

view,
text,
button,
input,
textarea,
image,
scroll-view {
	box-sizing: border-box;
}

button {
	margin: 0;
	padding: 0;
	background: transparent;
	line-height: 1.2;
}

button::after {
	border: 0;
}

.thought-page {
	min-height: 100vh;
	padding: 0;
	background: $thought-bg;
}

.tab-page {
	padding-bottom: calc(132rpx + env(safe-area-inset-bottom));
}

.fixed-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 50;
	background: rgba(255, 255, 255, 0.96);
	border-bottom: 1px solid rgba(139, 92, 246, 0.08);
	backdrop-filter: blur(16rpx);
}

.status-spacer {
	height: var(--status-bar-height);
}

.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 92rpx;
	padding: 0 28rpx;
}

.nav-title {
	position: absolute;
	left: 160rpx;
	right: 160rpx;
	text-align: center;
	font-size: 34rpx;
	font-weight: 600;
	color: $thought-text;
}

.nav-side {
	display: flex;
	align-items: center;
	gap: 18rpx;
	min-width: 112rpx;
}

.nav-side.is-right {
	justify-content: flex-end;
	margin-left: auto;
}

.nav-action {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	color: $thought-accent;
	font-size: 28rpx;
	font-weight: 500;
	line-height: 1;
}

.page-body {
	padding: calc(var(--status-bar-height) + 114rpx) 0 40rpx;
}

.page-body.has-fixed-tabs {
	padding-top: calc(var(--status-bar-height) + 178rpx);
}

.page-body.has-padding {
	padding-left: 28rpx;
	padding-right: 28rpx;
}

.top-bar-title {
	display: block;
	font-size: 38rpx;
	font-weight: 600;
	color: $thought-text;
}

.top-bar-subtitle {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: $thought-muted;
}

.icon-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: $thought-surface;
	color: $thought-text;
	font-size: 30rpx;
}

.segment-bar {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 48rpx;
	padding: 0 28rpx 16rpx;
	overflow-x: auto;
	white-space: nowrap;
}

.segment-item {
	position: relative;
	padding: 10rpx 0 14rpx;
	font-size: 30rpx;
	color: $thought-muted;
}

.segment-item.is-active {
	color: $thought-text;
	font-weight: 600;
}

.segment-item.is-active::after {
	content: '';
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 4rpx;
	border-radius: 999rpx;
	background: $thought-accent;
}

.action-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16rpx;
	padding: 0 28rpx;
}

.entry-card,
.feed-card,
.stat-card,
.panel-card,
.composer-card {
	border-radius: 0;
	background: $thought-surface;
	box-shadow: none;
}

.entry-card {
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 24rpx;
	border-radius: 12rpx;
	background: $thought-soft;
}

.entry-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64rpx;
	height: 64rpx;
	border-radius: 10rpx;
	background: #ffffff;
	font-size: 30rpx;
}

.entry-title {
	font-size: 30rpx;
	font-weight: 600;
	color: $thought-text;
}

.entry-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	color: $thought-muted;
}

.section-block {
	margin-top: 20rpx;
}

.section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	padding: 8rpx 28rpx 18rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: 600;
	color: $thought-text;
}

.section-link {
	font-size: 24rpx;
	color: $thought-accent;
}

.feed-list {
	display: flex;
	flex-direction: column;
	gap: 0;
	background: #ffffff;
}

.feed-card {
	position: relative;
	padding: 30rpx 28rpx 28rpx;
	border-bottom: 1px solid $thought-line;
}

.feed-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
}

.feed-user {
	display: flex;
	align-items: center;
	gap: 16rpx;
	min-width: 0;
}

.avatar {
	width: 76rpx;
	height: 76rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #f1f1f1, #e7e7e7);
	flex-shrink: 0;
	border: 2px solid rgba(139, 92, 246, 0.1);
}

.feed-name {
	font-size: 28rpx;
	font-weight: 600;
	color: $thought-text;
}

.feed-meta {
	margin-top: 6rpx;
	font-size: 22rpx;
	color: $thought-muted;
}

.feed-title {
	margin-top: 20rpx;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 1.5;
	color: $thought-text;
}

.feed-content {
	display: block;
	margin-top: 14rpx;
	font-size: 28rpx;
	line-height: 1.75;
	color: #4a4a4a;
}

.feed-image-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 10rpx;
	margin-top: 20rpx;
}

.feed-image {
	width: 100%;
	height: 192rpx;
	border-radius: 8rpx;
	background: #ececec;
}

.tag-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
}

.tag-chip {
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: rgba(139, 92, 246, 0.1);
	font-size: 22rpx;
	color: $thought-accent;
}

.feed-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 22rpx;
	padding-top: 0;
	border-top: 0;
}

.feed-action-group {
	display: flex;
	align-items: center;
	gap: 28rpx;
}

.feed-action {
	display: inline-flex;
	align-items: center;
	gap: 10rpx;
	font-size: 24rpx;
	color: $thought-muted;
}

.composer-card {
	padding: 0 28rpx 40rpx;
}

.field-label {
	display: block;
	margin-bottom: 16rpx;
	font-size: 26rpx;
	font-weight: 600;
	color: $thought-text;
}

.text-input,
.text-area,
.picker-field {
	width: 100%;
	padding: 22rpx 0;
	border-radius: 0;
	background: #ffffff;
	border: 0;
	border-bottom: 1px solid $thought-line;
	font-size: 28rpx;
	color: $thought-text;
}

.text-area {
	min-height: 360rpx;
	line-height: 1.8;
}

.helper-text {
	margin-top: 12rpx;
	font-size: 22rpx;
	color: $thought-faint;
}

.upload-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 14rpx;
}

.upload-item,
.upload-trigger {
	position: relative;
	width: 100%;
	height: 200rpx;
	border-radius: 8rpx;
	overflow: hidden;
	background: #f3f3f3;
}

.upload-item image,
.upload-trigger image {
	width: 100%;
	height: 100%;
}

.upload-trigger {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	border: 1px dashed #d8d8d8;
	background: #fafafa;
	color: $thought-faint;
	font-size: 22rpx;
}

.upload-plus {
	margin-bottom: 10rpx;
	font-size: 40rpx;
}

.remove-badge {
	position: absolute;
	top: 10rpx;
	right: 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 38rpx;
	height: 38rpx;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.45);
	color: #fff;
	font-size: 22rpx;
}

.chip-row {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
}

.choice-chip {
	padding: 14rpx 22rpx;
	border-radius: 999rpx;
	background: #f6f6f6;
	font-size: 24rpx;
	color: $thought-muted;
	border: 1px solid transparent;
}

.choice-chip.is-active {
	background: rgba(139, 92, 246, 0.12);
	color: $thought-accent-deep;
	border-color: rgba(139, 92, 246, 0.28);
}

.primary-button,
.secondary-button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 92rpx;
	border-radius: 12rpx;
	font-size: 30rpx;
	font-weight: 600;
}

.primary-button {
	background: $thought-accent;
	color: #ffffff;
}

.secondary-button {
	background: #f3f3f3;
	color: $thought-text;
}

.button-stack {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-top: 32rpx;
}

.record-tabs {
	display: flex;
	gap: 0;
	padding: 0 28rpx 16rpx;
	overflow-x: auto;
	white-space: nowrap;
}

.record-tab {
	position: relative;
	padding: 16rpx 28rpx 18rpx 0;
	border-radius: 0;
	background: transparent;
	font-size: 28rpx;
	color: $thought-muted;
}

.record-tab.is-active {
	background: transparent;
	color: $thought-text;
	font-weight: 600;
}

.record-tab.is-active::after {
	content: '';
	position: absolute;
	left: 0;
	bottom: 4rpx;
	width: 48rpx;
	height: 4rpx;
	border-radius: 999rpx;
	background: $thought-accent;
}

.stat-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0;
	border-top: 1px solid $thought-line;
	margin-top: 30rpx;
}

.stat-card {
	padding: 26rpx 20rpx 4rpx;
	text-align: center;
}

.stat-value {
	font-size: 36rpx;
	font-weight: 700;
	color: $thought-text;
}

.stat-label {
	margin-top: 10rpx;
	font-size: 22rpx;
	color: $thought-faint;
}

.menu-list {
	margin-top: 20rpx;
	border-radius: 0;
	background: $thought-surface;
	overflow: hidden;
}

.menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 24rpx;
	font-size: 28rpx;
	color: $thought-text;
}

.menu-item + .menu-item {
	border-top: 1px solid $thought-line;
}

.empty-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 24rpx;
	text-align: center;
	color: $thought-faint;
	font-size: 26rpx;
}

.empty-box image,
.empty-box .empty-image {
	width: 260rpx;
	height: 260rpx;
	margin-bottom: 24rpx;
	display: block;
}
</style>
