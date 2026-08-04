<template>
	<view class="square-page">
		<view class="square-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="header-aura aura-left"></view>
			<view class="header-aura aura-right"></view>
			<view class="top-row">
				<view class="brand-block">
					<view class="brand-slogan">
						<text class="brand-subtitle">{{ slogo }}</text>
						<view class="slogan-mark"></view>
						<view class="slogan-spark"></view>
					</view>
				</view>
			</view>

			<view class="nav-row">
				<view class="feed-tabs">
					<view
						v-for="item in navTabs"
						:key="item.value"
						class="feed-tab"
						:class="{ active: activeNavTab === item.value }"
						@click="activeNavTab = item.value"
					>
						<text>{{ item.label }}</text>
					</view>
				</view>
				<!-- <view class="filter-button" @click="openFilterPanel">
					<text>筛选</text>
					<text class="filter-icon"></text>
				</view> -->
			</view>
		</view>

		<scroll-view
			class="content-scroll"
			:style="{ top: headerTotalHeight + 'px' }"
			scroll-y
			enhanced
			:show-scrollbar="false"
			refresher-enabled
			refresher-background="#fffafd"
			refresher-default-style="none"
			:refresher-threshold="36"
			:refresher-max-drag-distance="44"
			:refresher-triggered="refresherTriggered"
			@refresherrefresh="handleRefresherRefresh"
			@scrolltolower="loadMoreFeed"
		>
			<view slot="refresher" class="refresh-slot">
				<text class="refresh-icon">↻</text>
				<text>{{ refreshing ? '正在刷新广场' : '下拉刷新广场' }}</text>
				<view class="soft-dots">
					<text></text>
					<text></text>
					<text></text>
				</view>
			</view>

			<view class="content-body">
				<view v-if="loading && !visiblePosts.length" class="skeleton-list">
					<view v-for="index in 3" :key="index" class="skeleton-card">
						<view class="skeleton-head">
							<view class="skeleton-avatar skeleton-shimmer"></view>
							<view class="skeleton-lines">
								<view class="skeleton-line short skeleton-shimmer"></view>
								<view class="skeleton-line tiny skeleton-shimmer"></view>
							</view>
						</view>
						<view class="skeleton-line full skeleton-shimmer"></view>
						<view class="skeleton-grid">
							<view class="skeleton-img skeleton-shimmer"></view>
							<view class="skeleton-img skeleton-shimmer"></view>
							<view class="skeleton-img skeleton-shimmer"></view>
						</view>
					</view>
				</view>

				<view v-else-if="!visiblePosts.length" class="empty-state">
					<image src="/static/empty.png" mode="aspectFit" />
					<text>这里还没有内容</text>
				</view>

				<view v-else class="post-list">
					<view
						v-for="post in visiblePosts"
						:key="post.id"
						class="post-card"
					>
						<view class="post-head">
							<image class="avatar" :src="post.avatar" mode="aspectFill" />
							<view class="user-meta">
								<view class="name-row">
									<VipName class="nickname" :name="post.name" :is-member="!reviewMode && post.isMember" />
									<view v-if="!reviewMode" class="user-pill" :class="post.gender === '男' ? 'male' : 'female'">
										<image class="gender-icon" :src="getGenderIcon(post.gender)" mode="aspectFit" />
										<text>{{ post.age }}</text>
									</view>
								</view>
								<text class="time-line">{{ reviewMode ? post.time : `${post.time} · ${post.city}` }}</text>
							</view>
							<!-- <view v-if="post.followable" class="follow-button" @click.stop="toggleFollow(post)">
								<text>{{ post.followed ? '已订阅' : '订阅' }}</text>
							</view> -->
							<text class="more-dot">•••</text>
						</view>

						<text class="post-text">{{ post.text }}</text>

						<view v-if="post.images.length" class="image-grid">
							<image
								v-for="(url, index) in post.images.slice(0, 3)"
								:key="index"
								class="post-image"
								:src="url"
								mode="aspectFill"
							/>
						</view>

						<view class="place-chip">
							<text class="pin-icon"></text>
							<text>{{ post.place }}</text>
						</view>

						<view class="post-footer">
							<view class="action like-action" :class="{ active: post.resonated, busy: post.resonanceBusy }" @click.stop="toggleLike(post)">
								<image class="like-icon" :src="post.resonated ? '/static/img/dianzan-active.png' : '/static/img/dianzan.png'" mode="aspectFit" />
								<text>{{ post.likes }}</text>
							</view>
							<view class="action">
								<image class="comment-icon" src="/static/tab/message.png" mode="aspectFit" />
								<text>{{ post.comments }}</text>
							</view>
							<view class="action" :class="{ 'favorite-active': post.favorited }" @click.stop="toggleFavorite(post)">
								<text class="star-icon">{{ post.favorited ? '★' : '☆' }}</text>
								<text>{{ post.favorites }}</text>
							</view>
							<view class="action share-action">
								<image class="share-icon" src="/static/img/share-icon.png" mode="aspectFit" />
								<text>分享</text>
							</view>
						</view>
					</view>
				</view>

				<view v-if="visiblePosts.length" class="load-more-state">
					<text class="load-text">
						{{ loadingMore ? '正在加载更多内容' : (hasMore ? '继续下滑，发现更多生活分享' : '暂时只有这些啦') }}
					</text>
					<view v-if="loadingMore || hasMore" class="soft-dots">
						<text></text>
						<text></text>
						<text></text>
					</view>
				</view>
			</view>
		</scroll-view>

		<view v-if="filterPanelVisible" class="filter-mask" @click="closeFilterPanel">
			<view class="filter-sheet" @click.stop>
				<view class="sheet-head">
					<view class="sheet-title-block">
						<text class="sheet-title">选择标签</text>
					</view>
					<text class="sheet-close" @click="closeFilterPanel">×</text>
				</view>
				<view class="filter-grid">
					<view
						v-for="item in categories"
						:key="item.value"
						class="filter-chip"
						:class="{ active: activeCategory === item.value }"
						@click="selectCategory(item.value)"
					>
						<text>{{ item.label }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="publish-fab" hover-class="publish-fab-hover" hover-stay-time="80" @click="goPublish">
			<text class="publish-fab-plus">＋</text>
			<text class="publish-fab-text">发布</text>
		</view>
		<ReviewTabBar v-if="reviewMode" active="square" />
	</view>
</template>

<script>
import { COMMUNITY_SLOGO, COMMUNITY_TAG_OPTIONS, DEFAULT_AVATAR_URL, SLOGO, TAG_OPTIONS } from '../../config';
import { isCommunityMode, syncTabBarVisibility } from '../../utils/appMode';
import { getLocalPosts } from '../../utils/localPosts';
import VipName from '../../components/VipName.vue';
import ReviewTabBar from '../../components/ReviewTabBar.vue';

export default {
	components: { ReviewTabBar, VipName },
	data() {
		return {
			reviewMode: true,
			statusBarHeight: 44,
			headerTotalHeight: 128,
			loading: false,
			refreshing: false,
			refresherTriggered: false,
			loadingMore: false,
			page: 1,
			pageSize: 10,
			hasMore: false,
			feedLoaded: false,
			slogo: SLOGO,
			activeNavTab: 'recommend',
			activeCategory: 'all',
			filterPanelVisible: false,
			navTabs: [{ label: '最新', value: 'recommend' }],
			categories: [
				{ label: '全部', value: 'all' },
				...COMMUNITY_TAG_OPTIONS.map((tag) => ({ label: tag, value: tag }))
			],
			posts: [],
			fallbackPosts: [
				{
					id: 'life_001',
					name: '晨光手记',
					avatar: DEFAULT_AVATAR_URL,
					gender: '女',
					age: 24,
					time: '8分钟前',
					city: '杭州',
					text: '今天比昨天早起了十分钟，给自己做了一份热早餐。小小的改变，也值得认真记录。',
					place: '生活',
					images: ['/static/img/yujian-bg.png'],
					likes: 36,
					comments: 8,
					favorites: 12,
					favorited: false,
					category: '生活',
					followable: false,
					followed: false
				},
				{
					id: 'life_002',
					name: '沿途有光',
					avatar: DEFAULT_AVATAR_URL,
					gender: '男',
					age: 27,
					time: '25分钟前',
					city: '成都',
					text: '下班路上看到晚霞，停下来吹了几分钟风。忙碌的日子里，也要记得看看天空。',
					place: '日常',
					images: ['/static/share.png'],
					likes: 52,
					comments: 11,
					favorites: 18,
					favorited: false,
					category: '日常',
					followable: false,
					followed: true
				},
				{
					id: 'life_003',
					name: '慢慢成长',
					avatar: DEFAULT_AVATAR_URL,
					gender: '女',
					age: 26,
					time: '1小时前',
					city: '南京',
					text: '坚持阅读的第30天。每天十页看起来不多，回头看却已经走了很远。',
					place: '阅读',
					images: [],
					likes: 64,
					comments: 15,
					favorites: 27,
					favorited: false,
					category: '阅读',
					followable: false,
					followed: false
				},
				{
					id: 'life_004',
					name: '山海之间',
					avatar: DEFAULT_AVATAR_URL,
					gender: '男',
					age: 29,
					time: '2小时前',
					city: '厦门',
					text: '周末去海边走了很久。旅行的意义，也许就是让心重新变得宽阔。',
					place: '旅行',
					images: ['/static/beijing.png'],
					likes: 81,
					comments: 19,
					favorites: 34,
					favorited: false,
					category: '旅行',
					followable: false,
					followed: true
				},
				{
					id: 'life_005',
					name: '今日晴朗',
					avatar: DEFAULT_AVATAR_URL,
					gender: '女',
					age: 23,
					time: '3小时前',
					city: '武汉',
					text: '鼓起勇气完成了第一次公开分享。认真记录生活，也是在收藏自己的成长。',
					place: '成长',
					images: [],
					likes: 47,
					comments: 13,
					favorites: 16,
					favorited: false,
					category: '成长',
					followable: false,
					followed: false
				},
				{
					id: 'life_006',
					name: '一杯温水',
					avatar: DEFAULT_AVATAR_URL,
					gender: '男',
					age: 31,
					time: '今天 09:20',
					city: '苏州',
					text: '收到一句真诚的谢谢，心情亮了一整天。善意很小，却真的可以传递很远。',
					place: '心情',
					images: ['/static/img/yujian-bg.png'],
					likes: 73,
					comments: 17,
					favorites: 22,
					favorited: false,
					category: '心情',
					followable: false,
					followed: false
				},
				{
					id: 'life_007',
					name: '厨房日记',
					avatar: DEFAULT_AVATAR_URL,
					gender: '女',
					age: 28,
					time: '昨天',
					city: '广州',
					text: '第一次学会做家乡菜，味道还不够完美，但家人吃得很开心。',
					place: '美食',
					images: ['/static/share.png'],
					likes: 58,
					comments: 12,
					favorites: 25,
					favorited: false,
					category: '美食',
					followable: false,
					followed: true
				},
				{
					id: 'life_008',
					name: '光影收藏家',
					avatar: DEFAULT_AVATAR_URL,
					gender: '男',
					age: 25,
					time: '2天前',
					city: '重庆',
					text: '开始用镜头记录普通街巷后，才发现熟悉的城市每天都有新的表情。',
					place: '摄影',
					images: ['/static/img/yujian-bg.png'],
					likes: 89,
					comments: 20,
					favorites: 41,
					favorited: false,
					category: '摄影',
					followable: false,
					followed: false
				}
			]
		};
	},
	computed: {
		filteredPosts() {
			let list = this.posts;
			if (this.activeNavTab === 'follow') {
				list = list.filter((item) => item.followed);
			}
			if (this.activeCategory !== 'all') {
				list = list.filter((item) => item.category === this.activeCategory);
			}
			return list;
		},
		visiblePosts() {
			return this.filteredPosts;
		}
	},
	watch: {
		activeNavTab() {
			this.loadFeed(true);
		}
	},
	onLoad() {
		this.syncModePresentation();
		this.setHeaderMetrics();
		this.loadFeed(true);
	},
	onShow() {
		this.syncModePresentation();
		if (this.feedLoaded) this.loadFeed(true, { silent: true });
	},
	methods: {
		syncModePresentation() {
			this.reviewMode = isCommunityMode();
			this.slogo = this.reviewMode ? COMMUNITY_SLOGO : SLOGO;
			this.navTabs = this.reviewMode
				? [{ label: '最新', value: 'recommend' }]
				: [
					{ label: '推荐', value: 'recommend' },
					{ label: '精选', value: 'follow' },
					{ label: '日常', value: 'nearby' }
				];
			this.categories = [
				{ label: '全部', value: 'all' },
				...(this.reviewMode ? COMMUNITY_TAG_OPTIONS : TAG_OPTIONS).map((tag) => ({ label: tag, value: tag }))
			];
			if (this.reviewMode) this.activeNavTab = 'recommend';
			syncTabBarVisibility();
		},
		setHeaderMetrics() {
			try {
				const info = uni.getSystemInfoSync();
				const rpxToPx = (info.windowWidth || 375) / 750;
				this.statusBarHeight = info.statusBarHeight || 44;
				this.headerTotalHeight = this.statusBarHeight + Math.round(144 * rpxToPx);
			} catch (error) {
				this.statusBarHeight = 44;
				this.headerTotalHeight = 116;
			}
		},
		resetList() {
			this.page = 1;
			this.hasMore = false;
		},
		async loadFeed(reset = false, options = {}) {
			if (reset) this.page = 1;
			if (reset && !options.silent) this.loading = true;
			const localPosts = getLocalPosts().map((item) => this.mapLocalPost(item));
			this.posts = [
				...localPosts,
				...this.fallbackPosts.map((item) => ({ ...item, images: [...item.images] }))
			];
			this.hasMore = false;
			this.feedLoaded = true;
			this.loading = false;
			this.loadingMore = false;
		},
		handleRefresherRefresh() {
			if (this.refreshing) return;
			this.refreshing = true;
			this.refresherTriggered = true;
			this.loadFeed(true, { silent: true }).finally(() => {
				this.refreshing = false;
				this.refresherTriggered = false;
			});
		},
		loadMoreFeed() {
			return;
		},
		goPublish() {
			uni.navigateTo({ url: '/pages/create/index' });
		},
		mapLocalPost(item) {
			const author = item.author || {};
			const tags = Array.isArray(item.tags) ? item.tags : [];
			return {
				id: item.id,
				name: author.name || '我',
				avatar: author.avatar || DEFAULT_AVATAR_URL,
				gender: author.gender || '',
				age: Number(author.age || 0),
				time: this.formatLocalPostTime(item.createdAt),
				city: author.city || '',
				text: item.content || '',
				place: tags[0] || '生活',
				images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
				likes: Number(item.likes || 0),
				comments: Number(item.comments || 0),
				favorites: Number(item.favorites || 0),
				favorited: false,
				category: tags[0] || '生活',
				followable: false,
				followed: false,
				local: true
			};
		},
		formatLocalPostTime(createdAt) {
			const timestamp = new Date(createdAt || 0).getTime();
			if (!timestamp) return '刚刚';
			const elapsed = Math.max(0, Date.now() - timestamp);
			const minutes = Math.floor(elapsed / 60000);
			if (minutes < 1) return '刚刚';
			if (minutes < 60) return `${minutes}分钟前`;
			const hours = Math.floor(minutes / 60);
			if (hours < 24) return `${hours}小时前`;
			const days = Math.floor(hours / 24);
			return days === 1 ? '昨天' : `${days}天前`;
		},
		getGenderIcon(gender) {
			return gender === '男' ? '/static/img/nan-icon.png' : '/static/img/nv-icon.png';
		},
		async toggleLike(post) {
			if (!post || !post.id || post.resonanceBusy) return;
			const previousResonated = Boolean(post.resonated);
			const previousLikes = Number(post.likes || 0);
			const nextResonated = !previousResonated;
			post.resonated = nextResonated;
			post.likes = Math.max(0, previousLikes + (nextResonated ? 1 : -1));
			uni.showToast({ title: nextResonated ? '已点赞' : '已取消点赞', icon: 'none' });
		},
		async toggleFavorite(post) {
			if (!post || !post.id) return;
			const previousFavorited = Boolean(post.favorited);
			const previousFavorites = Number(post.favorites || 0);
			const nextFavorited = !previousFavorited;
			post.favorited = nextFavorited;
			post.favorites = Math.max(0, previousFavorites + (nextFavorited ? 1 : -1));
			uni.showToast({ title: nextFavorited ? '已收藏' : '已取消收藏', icon: 'none' });
		},
		openFilterPanel() {
			this.filterPanelVisible = true;
		},
		closeFilterPanel() {
			this.filterPanelVisible = false;
		},
		selectCategory(value) {
			this.activeCategory = value;
			this.closeFilterPanel();
			this.resetList();
		}
	}
};
</script>

<style lang="scss" scoped>
.square-page {
	position: relative;
	min-height: 100vh;
	background: #fffafd;
	overflow: hidden;
}

.square-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 20;
	padding-left: 28rpx;
	padding-right: 28rpx;
	padding-bottom: 14rpx;
	overflow: hidden;
	background: linear-gradient(135deg, #fff1f8 0%, #f6efff 48%, #fffafd 100%);
	backdrop-filter: blur(18rpx);
	box-shadow: 0 1rpx 0 rgba(238, 232, 242, 0.8), 0 14rpx 32rpx rgba(143, 112, 210, 0.06);
}

.header-aura {
	position: absolute;
	pointer-events: none;
	z-index: 0;
	filter: blur(2rpx);
	opacity: 0.88;
}

.aura-left {
	left: -120rpx;
	top: -80rpx;
	width: 360rpx;
	height: 230rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(212, 104, 138, 0.26) 0%, rgba(212, 104, 138, 0.12) 46%, transparent 72%);
}

.aura-right {
	right: -150rpx;
	top: -70rpx;
	width: 430rpx;
	height: 250rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(143, 112, 210, 0.24) 0%, rgba(143, 112, 210, 0.1) 48%, transparent 76%);
}

.top-row,
.nav-row,
.feed-tabs,
.post-head,
.name-row,
.post-footer,
.action,
.place-chip,
.refresh-slot,
.load-more-state {
	display: flex;
	align-items: center;
}

.top-row {
	position: relative;
	z-index: 1;
	justify-content: flex-start;
	height: 76rpx;
	padding-right: 220rpx;
}

.brand-block {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	min-width: 0;
}

.brand-slogan {
	position: relative;
	max-width: 470rpx;
	overflow: visible;
}

.brand-subtitle {
	display: inline-block;
	max-width: 470rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #625a72;
	font-size: 32rpx;
	font-weight: 400;
	line-height: 1;
	animation: squareTitleFloatIn 0.82s ease-out both, squareTitleGlow 4s ease-in-out 0.82s infinite;
}

.slogan-mark {
	position: absolute;
	right: 8rpx;
	bottom: -18rpx;
	width: 104rpx;
	height: 18rpx;
	border-bottom: 5rpx solid #d4688a;
	border-radius: 50%;
	transform: rotate(-4deg) scaleX(0);
	transform-origin: left center;
	animation: squareMarkDraw 0.68s ease-out 0.32s forwards, squareMarkBreathe 3.4s ease-in-out 1.1s infinite;
}

.slogan-spark {
	position: absolute;
	right: -18rpx;
	top: -8rpx;
	width: 10rpx;
	height: 10rpx;
	border-radius: 50%;
	background: #ef9fc0;
	box-shadow: -12rpx 14rpx 0 -2rpx #9a7cff;
	opacity: 0;
	animation: squareSparkTwinkle 3s ease-in-out 0.9s infinite;
}

@keyframes squareTitleFloatIn {
	from {
		opacity: 0;
		transform: translateY(12rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes squareTitleGlow {
	0%,
	100% {
		color: #625a72;
	}

	50% {
		color: #8d67a9;
	}
}

@keyframes squareMarkDraw {
	from {
		opacity: 0;
		transform: rotate(-4deg) scaleX(0);
	}

	to {
		opacity: 1;
		transform: rotate(-4deg) scaleX(1);
	}
}

@keyframes squareMarkBreathe {
	0%,
	100% {
		opacity: 0.76;
		transform: rotate(-4deg) scaleX(1) translateX(0);
	}

	50% {
		opacity: 1;
		transform: rotate(-7deg) scaleX(1.08) translateX(-6rpx);
	}
}

@keyframes squareSparkTwinkle {
	0%,
	100% {
		opacity: 0;
		transform: scale(0.72);
	}

	42%,
	58% {
		opacity: 0.8;
		transform: scale(1);
	}
}

.nav-row {
	position: relative;
	z-index: 1;
	justify-content: space-between;
	height: 52rpx;
	gap: 20rpx;
	box-sizing: border-box;
}

.feed-tabs {
	gap: 44rpx;
	min-width: 0;
	flex: 1;
	margin-top: 20rpx;
}

.feed-tab {
	position: relative;
	padding-bottom: 10rpx;
	color: #aaa3bd;
	font-size: 28rpx;
	line-height: 1;
}

.feed-tab.active {
	color: #24284f;
	font-weight: 900;
}

.feed-tab.active::after {
	content: '';
	position: absolute;
	left: 50%;
	bottom: 0;
	width: 38rpx;
	height: 5rpx;
	border-radius: 999rpx;
	background: linear-gradient(90deg, #d4688a, #8f70d2);
	transform: translateX(-50%);
}

.filter-button {
	display: flex;
	align-items: center;
	gap: 8rpx;
	height: 42rpx;
	padding: 0;
	color: #6f6384;
	font-size: 22rpx;
	font-weight: 700;
	flex-shrink: 0;
}

.filter-icon {
	position: relative;
	width: 18rpx;
	height: 14rpx;
	border: 2rpx solid #d4688a;
	border-top-width: 3rpx;
	border-radius: 5rpx 5rpx 8rpx 8rpx;
	transform: scaleX(0.9);
}

.content-scroll {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fffafd;
}

.publish-fab {
	position: fixed;
	right: 28rpx;
	bottom: calc(132rpx + env(safe-area-inset-bottom));
	z-index: 26;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	height: 72rpx;
	min-width: 150rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: #d4688a;
	color: #ffffff;
	box-shadow: 0 12rpx 28rpx rgba(212, 104, 138, 0.24), 0 0 0 8rpx rgba(255, 240, 246, 0.92);
	box-sizing: border-box;
	transition: transform 0.16s ease, box-shadow 0.16s ease;
	animation: publishFloat 2.8s ease-in-out infinite;
}

.publish-fab-hover {
	transform: translateY(2rpx) scale(0.98);
	box-shadow: 0 8rpx 22rpx rgba(212, 104, 138, 0.2), 0 0 0 6rpx rgba(255, 240, 246, 0.86);
}

.publish-fab-plus {
	font-size: 32rpx;
	font-weight: 400;
	line-height: 1;
	margin-top: -2rpx;
}

.publish-fab-text {
	font-size: 25rpx;
	font-weight: 600;
	line-height: 1;
}

@keyframes publishFloat {
	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(-4rpx);
	}
}

.refresh-slot,
.load-more-state {
	justify-content: center;
	gap: 8rpx;
	width: 100%;
	color: #aaa3bd;
	font-size: 20rpx;
	background: #fffafd;
}

.refresh-slot {
	height: 42px;
}

.refresh-icon {
	color: #d4688a;
	font-size: 24rpx;
	animation: refresh-rotate 1.1s linear infinite;
}

.soft-dots {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.soft-dots text {
	width: 5rpx;
	height: 5rpx;
	border-radius: 50%;
	background: #d4688a;
	animation: dot-bounce 1.2s ease-in-out infinite;
}

.soft-dots text:nth-child(2) {
	animation-delay: 120ms;
}

.soft-dots text:nth-child(3) {
	animation-delay: 240ms;
}

@keyframes refresh-rotate {
	to {
		transform: rotate(360deg);
	}
}

@keyframes dot-bounce {
	0%,
	100% {
		opacity: 0.36;
		transform: translateY(0);
	}
	50% {
		opacity: 0.9;
		transform: translateY(-3rpx);
	}
}

.content-body {
	padding: 12rpx 16rpx calc(136rpx + env(safe-area-inset-bottom));
}

.post-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.post-card {
	padding: 26rpx 24rpx 20rpx;
	border-radius: 16rpx;
	background: #ffffff;
	border: 1rpx solid rgba(241, 232, 240, 0.92);
	box-shadow: 0 8rpx 24rpx rgba(142, 112, 152, 0.06);
}

.post-head {
	gap: 18rpx;
}

.avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: #f6f1f7;
	flex-shrink: 0;
}

.user-meta {
	flex: 1;
	min-width: 0;
}

.name-row {
	gap: 12rpx;
}

.nickname {
	max-width: 220rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #24284f;
	font-size: 29rpx;
	font-weight: 800;
}

.user-pill {
	display: flex;
	align-items: center;
	gap: 4rpx;
	height: 30rpx;
	padding: 0 10rpx;
	border-radius: 15rpx;
	font-size: 18rpx;
	font-weight: 700;
}

.gender-icon {
	width: 18rpx;
	height: 18rpx;
	flex-shrink: 0;
}

.user-pill.female {
	background: #fff0f6;
	color: #ef6f9f;
}

.user-pill.male {
	background: #f4f0ff;
	color: #8875d6;
}

.time-line {
	display: block;
	margin-top: 8rpx;
	color: #aaa3bd;
	font-size: 21rpx;
	line-height: 1;
}

.follow-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 116rpx;
	height: 46rpx;
	border-radius: 23rpx;
	border: 2rpx solid #ef7ead;
	color: #d4688a;
	font-size: 22rpx;
	font-weight: 700;
	flex-shrink: 0;
}

.more-dot {
	color: #c7bfca;
	font-size: 26rpx;
	letter-spacing: 0;
	flex-shrink: 0;
}

.post-text {
	display: block;
	margin-top: 24rpx;
	color: #2d2e34;
	font-size: 28rpx;
	line-height: 1.55;
	white-space: pre-line;
}

.image-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 14rpx;
	margin-top: 20rpx;
}

.post-image {
	width: 100%;
	height: 204rpx;
	border-radius: 14rpx;
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
	min-width: 92rpx;
	font-size: 22rpx;
}

.action.active {
	color: #ef7ead;
}

.action.favorite-active {
	color: #ef7ead;
}

.star-icon {
	font-size: 34rpx;
	line-height: 1;
}

.like-icon {
	width: 34rpx;
	height: 34rpx;
	flex-shrink: 0;
}

.like-action.busy {
	opacity: .55;
}

.comment-icon {
	width: 34rpx;
	height: 34rpx;
	flex-shrink: 0;
}

.share-icon {
	width: 34rpx;
	height: 34rpx;
	flex-shrink: 0;
}

.load-more-state {
	height: 64rpx;
	margin-top: 8rpx;
}

.load-text {
	font-size: 20rpx;
	color: #aaa3bd;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
	color: #aaa3bd;
	font-size: 24rpx;
}

.empty-state image {
	width: 180rpx;
	height: 180rpx;
	margin-bottom: 18rpx;
}

.skeleton-list {
	display: flex;
	flex-direction: column;
	gap: 22rpx;
}

.skeleton-card {
	padding: 26rpx 24rpx;
	border-radius: 16rpx;
	background: #ffffff;
}

.skeleton-head {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 18rpx;
}

.skeleton-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
}

.skeleton-lines {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.skeleton-line {
	height: 22rpx;
	border-radius: 999rpx;
}

.skeleton-line.short {
	width: 150rpx;
}

.skeleton-line.tiny {
	width: 110rpx;
}

.skeleton-line.full {
	width: 80%;
	margin-bottom: 18rpx;
}

.skeleton-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 14rpx;
}

.skeleton-img {
	height: 190rpx;
	border-radius: 14rpx;
}

.skeleton-shimmer {
	background: linear-gradient(90deg, #f0edf5 0%, #fff7fc 48%, #f0edf5 100%);
	background-size: 200% 100%;
	animation: skeleton-slide 1.4s ease-in-out infinite;
}

@keyframes skeleton-slide {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.filter-mask {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 60;
	background: rgba(36, 40, 79, 0.22);
	display: flex;
	align-items: flex-end;
	backdrop-filter: blur(8rpx);
}

.filter-sheet {
	width: 100%;
	padding: 32rpx 30rpx calc(42rpx + env(safe-area-inset-bottom));
	border-radius: 24rpx 24rpx 0 0;
	background:
		linear-gradient(180deg, rgba(255, 248, 253, 0.99), rgba(255, 251, 254, 1)),
		url('/static/img/yujian-bg.png') center top / cover no-repeat;
	box-shadow: 0 -18rpx 44rpx rgba(143, 112, 210, 0.12);
}

.sheet-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 28rpx;
}

.sheet-title-block {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.sheet-title {
	color: #24284f;
	font-size: 34rpx;
	font-weight: 900;
}

.sheet-kicker {
	color: #8f70d2;
	font-size: 17rpx;
	font-weight: 800;
	letter-spacing: 0;
	line-height: 1;
}

.sheet-close {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 52rpx;
	height: 52rpx;
	font-size: 40rpx;
	color: #b7aec6;
}

.filter-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	row-gap: 18rpx;
}

.filter-chip {
	position: relative;
	width: 150rpx;
	height: 54rpx;
	padding: 0 8rpx;
	border-radius: 16rpx;
	background: rgba(255, 255, 255, 0.86);
	border: 1rpx solid rgba(222, 213, 230, 0.92);
	color: #766e86;
	font-size: 23rpx;
	font-weight: 800;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 18rpx rgba(143, 112, 210, 0.055);
	box-sizing: border-box;
}

.filter-chip.active {
	background: linear-gradient(135deg, rgba(255, 234, 244, 0.96), rgba(247, 239, 255, 0.96));
	border-color: rgba(212, 104, 138, 0.45);
	color: #d4688a;
	box-shadow: 0 10rpx 22rpx rgba(212, 104, 138, 0.14);
}
</style>
