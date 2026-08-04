<template>
	<view class="thought-page records-page">
		<view class="fixed-header records-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-bar">
				<view class="nav-side">
					<view class="nav-action" @click="goBack">
						<image class="back-icon" src="/static/fanhui.png" mode="aspectFit" />
					</view>
				</view>
				<view class="nav-title">我的动态</view>
				<view class="nav-side is-right">
					<text class="record-count">{{ recordList.length }}</text>
				</view>
			</view>
		</view>

		<view class="records-body" :style="{ paddingTop: headerTotalHeight + 'px' }">
			<view v-if="loading && !recordList.length" class="state-box">
				<text class="state-text">加载中...</text>
			</view>

			<view v-else-if="!recordList.length" class="state-box">
				<image class="empty-image" src="/static/empty.png" mode="aspectFit" />
				<text class="state-text">还没有动态</text>
			</view>

			<view v-else class="post-list">
				<view
					v-for="item in recordList"
					:key="item.id"
					class="post-card"
					@click="goDetail(item.id)"
				>
					<view class="post-head">
						<image class="avatar" :src="getAvatar(item)" mode="aspectFill" />
						<view class="user-meta">
							<view class="name-row">
								<VipName class="nickname" :name="getAuthorName(item)" :is-member="!reviewMode && item.authorIsMember" />
								<view v-if="!reviewMode && getAge(item)" class="user-pill" :class="getGenderClass(item)">
									<image class="gender-icon" :src="getGenderIcon(getGender(item))" mode="aspectFit" />
									<text>{{ getAge(item) }}</text>
								</view>
							</view>
							<text class="time-line">{{ formatFeedTime(item.createdAt || item.openedAt || item.openAt) }}</text>
						</view>
						<view class="delete-btn" @click.stop="confirmDelete(item)">
							<text>删除</text>
						</view>
					</view>

					<text v-if="getPlainText(item)" class="post-text">{{ getPlainText(item) }}</text>

					<view v-if="getImages(item).length" class="image-grid">
						<image
							v-for="(url, index) in getImages(item).slice(0, 3)"
							:key="url + index"
							class="post-image"
							:src="url"
							mode="aspectFill"
						/>
					</view>

					<view v-if="!reviewMode && getPlace(item)" class="place-chip">
						<text class="pin-icon"></text>
						<text>{{ getPlace(item) }}</text>
					</view>

					<view class="post-footer">
						<view class="action active">
							<text class="heart-icon">♥</text>
							<text>{{ item.resonanceCount || item.likes || 0 }}</text>
						</view>
						<view class="action">
							<image class="comment-icon" src="/static/tab/message.png" mode="aspectFit" />
							<text>{{ item.commentCount || item.comments || 0 }}</text>
						</view>
						<view class="action" :class="{ 'favorite-active': item.isFavorited || item.favorited }">
							<text class="star-icon">{{ item.isFavorited || item.favorited ? '★' : '☆' }}</text>
							<text>{{ item.favoriteCount || item.favorites || 0 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { deleteThought, fetchMyThoughts } from '../../api/thought';
import { DEFAULT_AVATAR_URL, DEFAULT_PROFILE_NAME } from '../../config';
import { showRequestError } from '../../utils/feedback';
import { isCommunityMode } from '../../utils/appMode';
import VipName from '../../components/VipName.vue';

export default {
	components: { VipName },
	data() {
		return {
			reviewMode: true,
			loading: false,
			recordList: [],
			statusBarHeight: 44,
			headerTotalHeight: 96
		};
	},
	onLoad() {
		this.reviewMode = isCommunityMode();
		this.setHeaderLayout();
		this.loadRecords();
	},
	onPullDownRefresh() {
		this.loadRecords().finally(() => {
			uni.stopPullDownRefresh();
		});
	},
	methods: {
		setHeaderLayout() {
			try {
				const systemInfo = uni.getSystemInfoSync();
				this.statusBarHeight = systemInfo.statusBarHeight || 44;
				const rpxToPx = (systemInfo.windowWidth || 375) / 750;
				this.headerTotalHeight = this.statusBarHeight + Math.round(92 * rpxToPx);
			} catch (error) {
				this.statusBarHeight = 44;
				this.headerTotalHeight = 96;
			}
		},
		async loadRecords() {
			this.loading = true;
			try {
				const result = await fetchMyThoughts();
				const list = Array.isArray(result) ? result : result.items || [];
				this.recordList = list;
			} catch (error) {
				showRequestError(error, '加载动态失败');
			} finally {
				this.loading = false;
			}
		},
		getAvatar(item = {}) {
			return item.authorAvatarUrl || item.avatarUrl || DEFAULT_AVATAR_URL;
		},
		getAuthorName(item = {}) {
			return item.authorNickname || item.displayName || item.authorName || DEFAULT_PROFILE_NAME || '我';
		},
		getGender(item = {}) {
			return item.authorGender || item.gender || item.sex || '';
		},
		getAge(item = {}) {
			return item.authorAge || item.age || '';
		},
		getGenderClass(item = {}) {
			const gender = this.getGender(item);
			return gender === '男' || gender === 'male' || gender === 1 ? 'male' : 'female';
		},
		getGenderIcon(gender = '') {
			return gender === '男' || gender === 'male' || gender === 1 ? '/static/img/nan-icon.png' : '/static/img/nv-icon.png';
		},
		formatFeedTime(value) {
			if (!value) return '';
			const time = new Date(value).getTime();
			if (!time) return '';
			const diff = Date.now() - time;
			const minute = 60 * 1000;
			const hour = 60 * minute;
			const day = 24 * hour;
			if (diff < minute) return '刚刚';
			if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
			if (diff < day) return `${Math.floor(diff / hour)}小时前`;
			if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;
			const date = new Date(value);
			return `${date.getMonth() + 1}-${date.getDate()}`;
		},
		getImages(item = {}) {
			return (Array.isArray(item.images) ? item.images : [])
				.map((image) => (typeof image === 'string' ? image : image && image.url))
				.filter(Boolean);
		},
		getPlainText(item = {}) {
			const source = item.content || item.summary || item.text || '';
			return String(source)
				.replace(/<[^>]*>/g, ' ')
				.replace(/&nbsp;/g, ' ')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&amp;/g, '&')
				.replace(/\s+/g, ' ')
				.trim();
		},
		getPlace(item = {}) {
			const tags = Array.isArray(item.tags) ? item.tags : [];
			return item.topicTitle || tags[0] || '';
		},
		confirmDelete(item) {
			uni.showModal({
				title: '删除动态',
				content: '删除后不可恢复，确定要删除这条动态吗？',
				confirmText: '删除',
				confirmColor: '#d4688a',
				success: async (res) => {
					if (!res.confirm) return;
					await this.removeRecord(item.id);
				}
			});
		},
		async removeRecord(id) {
			try {
				uni.showLoading({ title: '删除中...', mask: true });
				await deleteThought(id);
				this.recordList = this.recordList.filter((item) => item.id !== id);
				uni.showToast({ title: '已删除', icon: 'success' });
			} catch (error) {
				showRequestError(error, '删除失败');
			} finally {
				uni.hideLoading();
			}
		},
		goDetail(id) {
			uni.navigateTo({
				url: `/pages/detail/index?id=${encodeURIComponent(id)}`
			});
		},
		goBack() {
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({ url: '/pages/profile/index' });
					}
				});
				return;
			}

			uni.switchTab({ url: '/pages/profile/index' });
		}
	}
};
</script>

<style lang="scss" scoped>
.records-page {
	background: #fffafd;
}

.records-header {
	background: rgba(255, 250, 253, 0.96);
	border-bottom: 1rpx solid rgba(241, 232, 240, 0.95);
}

.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 92rpx;
	padding: 0 22rpx;
}

.nav-side {
	width: 86rpx;
	display: flex;
	align-items: center;
}

.nav-side.is-right {
	justify-content: flex-end;
}

.nav-action {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: #ffffff;
	border: 1rpx solid rgba(222, 213, 230, 0.9);
}

.back-icon {
	width: 34rpx;
	height: 34rpx;
	display: block;
}

.nav-title {
	color: #24284f;
	font-size: 30rpx;
	font-weight: 900;
}

.record-count {
	min-width: 44rpx;
	height: 36rpx;
	padding: 0 12rpx;
	border-radius: 18rpx;
	background: #fff0f7;
	color: #d4688a;
	font-size: 21rpx;
	font-weight: 900;
	line-height: 36rpx;
	text-align: center;
	box-sizing: border-box;
}

.records-body {
	min-height: 100vh;
	padding-bottom: calc(36rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
}

.state-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 150rpx 24rpx;
	text-align: center;
}

.empty-image {
	width: 240rpx;
	height: 240rpx;
	margin-bottom: 22rpx;
	display: block;
}

.state-text {
	color: #aaa3bd;
	font-size: 25rpx;
}

.post-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	padding: 20rpx 20rpx 0;
}

.post-card {
	padding: 24rpx 22rpx 20rpx;
	border-radius: 18rpx;
	background: rgba(255, 255, 255, 0.96);
	border: 1rpx solid rgba(241, 232, 240, 0.9);
	box-shadow: 0 8rpx 24rpx rgba(142, 112, 152, 0.055);
}

.post-head,
.name-row,
.user-pill,
.place-chip,
.post-footer,
.action,
.delete-btn {
	display: flex;
	align-items: center;
}

.post-head {
	gap: 16rpx;
}

.avatar {
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	background: #f6f1f7;
	flex-shrink: 0;
}

.user-meta {
	flex: 1;
	min-width: 0;
}

.name-row {
	gap: 10rpx;
}

.nickname {
	max-width: 300rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #24284f;
	font-size: 27rpx;
	font-weight: 900;
}

.user-pill {
	gap: 4rpx;
	height: 30rpx;
	padding: 0 10rpx;
	border-radius: 15rpx;
	font-size: 18rpx;
	font-weight: 800;
}

.user-pill.female {
	background: #fff0f6;
	color: #ef6f9f;
}

.user-pill.male {
	background: #f4f0ff;
	color: #8875d6;
}

.gender-icon {
	width: 18rpx;
	height: 18rpx;
	flex-shrink: 0;
}

.time-line {
	display: block;
	margin-top: 8rpx;
	color: #aaa3bd;
	font-size: 21rpx;
	line-height: 1;
}

.delete-btn {
	justify-content: center;
	height: 42rpx;
	padding: 0 16rpx;
	border-radius: 21rpx;
	background: #fff0f7;
	color: #d4688a;
	font-size: 21rpx;
	font-weight: 800;
	flex-shrink: 0;
}

.post-text {
	display: -webkit-box;
	margin-top: 20rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	line-clamp: 3;
	color: #2d2e34;
	font-size: 28rpx;
	line-height: 1.58;
	white-space: pre-line;
}

.image-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
	margin-top: 18rpx;
}

.post-image {
	width: 100%;
	height: 166rpx;
	border-radius: 13rpx;
	background: #f6f1f7;
}

.place-chip {
	display: inline-flex;
	max-width: 100%;
	gap: 8rpx;
	height: 36rpx;
	margin-top: 18rpx;
	padding: 0 14rpx;
	border-radius: 18rpx;
	background: #fbf3f8;
	color: #9f93aa;
	font-size: 20rpx;
}

.pin-icon {
	position: relative;
	width: 14rpx;
	height: 14rpx;
	border: 3rpx solid #b9aeca;
	border-radius: 50%;
}

.post-footer {
	justify-content: space-between;
	margin-top: 22rpx;
	color: #8f89a1;
}

.action {
	gap: 8rpx;
	min-width: 96rpx;
	font-size: 22rpx;
	font-weight: 800;
}

.action.active,
.action.favorite-active {
	color: #ef7ead;
}

.heart-icon,
.star-icon {
	font-size: 34rpx;
	line-height: 1;
}

.comment-icon {
	width: 34rpx;
	height: 34rpx;
	flex-shrink: 0;
}
</style>
