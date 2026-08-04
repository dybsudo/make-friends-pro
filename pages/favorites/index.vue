<template>
	<view class="favorites-page">
		<view class="fixed-header favorites-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-bar">
				<view class="nav-side">
					<view class="nav-action" @click="goBack">
						<image class="back-icon" src="/static/fanhui.png" mode="aspectFit" />
					</view>
				</view>
				<view class="nav-title">我的收藏</view>
				<view class="nav-side is-right"></view>
			</view>
	
		</view>

		<scroll-view
			class="favorite-scroll"
			scroll-y
			enhanced
			:show-scrollbar="false"
			refresher-enabled
			refresher-background="#fffafd"
			:refresher-triggered="refresherTriggered"
			:style="{ paddingTop: headerTotalHeight + 'px' }"
			@refresherrefresh="handleRefresh"
			@scrolltolower="loadMore"
		>
			<view v-if="loading && !favoriteList.length" class="state-box">
				<text class="state-text">加载中...</text>
			</view>

			<view v-else-if="!favoriteList.length" class="state-box">
				<image class="empty-image" src="/static/empty.png" mode="aspectFit" />
				<text class="state-text">还没有收藏内容</text>
			</view>

			<view v-else class="favorite-list">
				<view
					v-for="item in favoriteList"
					:key="item.id"
					class="favorite-card"
					@click="goDetail(item.id)"
				>
					<view class="author-row">
						<image class="avatar" :src="item.authorAvatarUrl || defaultAvatarUrl" mode="aspectFill" />
						<view class="author-main">
							<view class="name-row">
								<VipName class="author-name" :name="getAuthorName(item)" :is-member="!reviewMode && item.authorIsMember" />
								<view v-if="!reviewMode && getGenderIcon(item)" class="gender-pill" :class="getGenderClass(item)">
									<image class="gender-icon" :src="getGenderIcon(item)" mode="aspectFit" />
									<text v-if="item.authorAge">{{ item.authorAge }}</text>
								</view>
							</view>
							<text class="meta-text">{{ formatDateTime(item.createdAt) }}</text>
						</view>
						<view class="unfavorite-btn" @click.stop="confirmUnfavorite(item)">
							<text>★</text>
						</view>
					</view>

					<text v-if="getPlainText(item)" class="content-text">{{ getPlainText(item) }}</text>

					<view v-if="getImages(item).length" class="image-row">
						<image
							v-for="(url, index) in getImages(item).slice(0, 3)"
							:key="url + index"
							class="favorite-image"
							:src="url"
							mode="aspectFill"
						/>
					</view>

					<view class="card-foot">
						<view v-if="!reviewMode" class="tag-row">
							<text v-if="item.topicTitle" class="tag-chip">{{ item.topicTitle }}</text>
							<text v-for="tag in (item.tags || []).slice(0, 2)" :key="tag" class="tag-chip">{{ tag }}</text>
						</view>
						<view class="stats-row">
							<text>♥ {{ item.resonanceCount || 0 }}</text>
							<text>评 {{ item.commentCount || 0 }}</text>
							<text>★ {{ item.favoriteCount || 0 }}</text>
						</view>
					</view>
				</view>
			</view>

			<view v-if="favoriteList.length" class="load-more">
				<text>{{ loadingMore ? '正在加载...' : (hasMore ? '继续下滑查看更多' : '已经到底啦') }}</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { fetchFavoriteThoughts, toggleThoughtFavorite } from '../../api/thought';
import { DEFAULT_AVATAR_URL } from '../../config';
import { formatDateTime } from '../../utils/date';
import { showRequestError } from '../../utils/feedback';
import { isCommunityMode } from '../../utils/appMode';
import VipName from '../../components/VipName.vue';

export default {
	components: { VipName },
	data() {
		return {
			reviewMode: true,
			defaultAvatarUrl: DEFAULT_AVATAR_URL,
			statusBarHeight: 44,
			headerTotalHeight: 148,
			page: 1,
			pageSize: 10,
			hasMore: true,
			loading: false,
			loadingMore: false,
			refresherTriggered: false,
			favoriteList: []
		};
	},
	computed: {
		totalText() {
			return this.favoriteList.length ? `已加载 ${this.favoriteList.length} 条收藏` : '收藏会保存在这里';
		}
	},
	onLoad() {
		this.reviewMode = isCommunityMode();
		this.setHeaderLayout();
		this.loadFavorites(true);
	},
	onShow() {
		this.reviewMode = isCommunityMode();
		if (this.favoriteList.length) this.loadFavorites(true, { silent: true });
	},
	methods: {
		formatDateTime,
		setHeaderLayout() {
			try {
				const systemInfo = uni.getSystemInfoSync();
				this.statusBarHeight = systemInfo.statusBarHeight || 44;
				const rpxToPx = (systemInfo.windowWidth || 375) / 750;
				this.headerTotalHeight = this.statusBarHeight + Math.round(148 * rpxToPx);
			} catch (error) {
				this.statusBarHeight = 44;
				this.headerTotalHeight = 148;
			}
		},
		normalizeResult(result) {
			if (Array.isArray(result)) {
				return {
					items: result,
					page: 1,
					hasMore: false
				};
			}

			return {
				items: Array.isArray(result && result.items) ? result.items : [],
				page: Number((result && result.page) || this.page),
				hasMore: Boolean(result && result.hasMore)
			};
		},
		async loadFavorites(reset = false, options = {}) {
			if (reset) {
				this.page = 1;
				this.hasMore = true;
			}
			if (reset && !options.silent) this.loading = true;
			if (!reset) this.loadingMore = true;

			try {
				const targetPage = reset ? 1 : this.page;
				const result = this.normalizeResult(await fetchFavoriteThoughts({
					page: targetPage,
					pageSize: this.pageSize
				}));
				this.favoriteList = reset ? result.items : [...this.favoriteList, ...result.items];
				this.page = result.page || targetPage;
				this.hasMore = result.hasMore;
			} catch (error) {
				if (!this.isMissingCapsuleError(error) && !options.silent) {
					showRequestError(error, '加载收藏失败');
				}
			} finally {
				this.loading = false;
				this.loadingMore = false;
			}
		},
		isMissingCapsuleError(error) {
			return Boolean(
				error &&
				error.statusCode === 404 &&
				String(error.message || '').includes('没有找到这枚胶囊')
			);
		},
		handleRefresh() {
			this.refresherTriggered = true;
			this.loadFavorites(true, { silent: true }).finally(() => {
				this.refresherTriggered = false;
			});
		},
		loadMore() {
			if (this.loadingMore || !this.hasMore) return;
			this.page += 1;
			this.loadFavorites(false);
		},
		getAuthorName(item = {}) {
			return item.authorNickname || item.displayName || item.authorStampNo || '想法来客';
		},
		getGenderType(item = {}) {
			const gender = item.authorGender || item.gender || item.sex;
			if (gender === '男' || gender === 'male' || gender === 1) return 'male';
			if (gender === '女' || gender === 'female' || gender === 2) return 'female';
			return '';
		},
		getGenderClass(item = {}) {
			return this.getGenderType(item);
		},
		getGenderIcon(item = {}) {
			const type = this.getGenderType(item);
			if (type === 'male') return '/static/img/nan-icon.png';
			if (type === 'female') return '/static/img/nv-icon.png';
			return '';
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
		confirmUnfavorite(item) {
			uni.showModal({
				title: '取消收藏',
				content: '确定从收藏列表移除这条内容吗？',
				confirmText: '移除',
				confirmColor: '#d4688a',
				success: async (res) => {
					if (!res.confirm) return;
					await this.unfavorite(item);
				}
			});
		},
		async unfavorite(item) {
			if (!item || !item.id) return;
			const previousList = [...this.favoriteList];
			this.favoriteList = this.favoriteList.filter((favorite) => favorite.id !== item.id);

			try {
				await toggleThoughtFavorite(item.id);
				uni.showToast({ title: '已取消收藏', icon: 'none' });
			} catch (error) {
				this.favoriteList = previousList;
				showRequestError(error, '取消收藏失败');
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
.favorites-page {
	min-height: 100vh;
	background: #fffafd;
}

.favorites-header {
	background: rgba(255, 250, 253, 0.96);
	border-bottom: 1rpx solid rgba(241, 232, 240, 0.95);
}

.nav-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 88rpx;
	padding: 0 22rpx;
}

.nav-side {
	width: 80rpx;
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

.summary-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 28rpx 20rpx;
	color: #aaa3bd;
	font-size: 22rpx;
}

.favorite-scroll {
	height: 100vh;
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
	margin-bottom: 20rpx;
	display: block;
}

.state-text {
	color: #aaa3bd;
	font-size: 25rpx;
}

.favorite-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
	padding: 20rpx 20rpx 0;
}

.favorite-card {
	padding: 24rpx 22rpx 20rpx;
	border-radius: 18rpx;
	background: rgba(255, 255, 255, 0.96);
	border: 1rpx solid rgba(241, 232, 240, 0.9);
	box-shadow: 0 8rpx 24rpx rgba(142, 112, 152, 0.055);
}

.author-row,
.name-row,
.gender-pill,
.card-foot,
.tag-row,
.stats-row,
.unfavorite-btn {
	display: flex;
	align-items: center;
}

.author-row {
	gap: 16rpx;
}

.avatar {
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	background: #f6f1f7;
	flex-shrink: 0;
}

.author-main {
	flex: 1;
	min-width: 0;
}

.name-row {
	gap: 10rpx;
}

.author-name {
	max-width: 300rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #24284f;
	font-size: 27rpx;
	font-weight: 900;
}

.gender-pill {
	gap: 4rpx;
	height: 30rpx;
	padding: 0 10rpx;
	border-radius: 15rpx;
	font-size: 18rpx;
	font-weight: 800;
}

.gender-pill.female {
	background: #fff0f6;
	color: #ef6f9f;
}

.gender-pill.male {
	background: #f4f0ff;
	color: #8875d6;
}

.gender-icon {
	width: 18rpx;
	height: 18rpx;
	flex-shrink: 0;
}

.meta-text {
	display: block;
	margin-top: 8rpx;
	color: #aaa3bd;
	font-size: 21rpx;
	line-height: 1;
}

.unfavorite-btn {
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: #fff0f7;
	color: #ef7ead;
	font-size: 34rpx;
	flex-shrink: 0;
}

.content-text {
	display: -webkit-box;
	margin-top: 20rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	line-clamp: 3;
	color: #2d2e34;
	font-size: 28rpx;
	line-height: 1.62;
}

.image-row {
	display: flex;
	gap: 10rpx;
	margin-top: 18rpx;
}

.favorite-image {
	width: 142rpx;
	height: 142rpx;
	border-radius: 12rpx;
	background: #f6f1f7;
}

.card-foot {
	justify-content: space-between;
	gap: 16rpx;
	margin-top: 20rpx;
}

.tag-row {
	flex: 1;
	flex-wrap: wrap;
	gap: 8rpx;
	min-width: 0;
}

.tag-chip {
	max-width: 180rpx;
	height: 34rpx;
	padding: 0 12rpx;
	border-radius: 17rpx;
	background: #fbf3f8;
	color: #9f93aa;
	font-size: 19rpx;
	line-height: 34rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.stats-row {
	gap: 14rpx;
	color: #8f89a1;
	font-size: 21rpx;
	flex-shrink: 0;
}

.load-more {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 76rpx;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	color: #aaa3bd;
	font-size: 21rpx;
}
</style>
