<template>
	<view class="detail-page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @click="goBack">
				<text class="back-arrow"></text>
			</view>
			<text class="nav-title">帖子详情</text>
			<view class="more-btn" @click="openReportSheet">•••</view>
		</view>

		<scroll-view class="detail-scroll" scroll-y enhanced :show-scrollbar="false" :style="{ paddingTop: headerTotalHeight + 'px' }">
			<view v-if="loading && !detail.id" class="skeleton-page">
				<view class="skeleton-card">
					<view class="skeleton-head">
						<view class="skeleton-avatar skeleton-shimmer"></view>
						<view class="skeleton-lines">
							<view class="skeleton-line short skeleton-shimmer"></view>
							<view class="skeleton-line tiny skeleton-shimmer"></view>
						</view>
					</view>
					<view class="skeleton-line full skeleton-shimmer"></view>
					<view class="skeleton-line full skeleton-shimmer"></view>
					<view class="skeleton-image skeleton-shimmer"></view>
				</view>
			</view>

			<view v-else-if="!detail.id" class="empty-state">
				<image src="/static/empty.png" mode="aspectFit" />
				<text>内容不存在或暂时不可见</text>
			</view>

			<view v-else class="content-wrap">
				<view class="post-card">
					<view class="author-row">
						<image class="author-avatar" :src="detail.authorAvatarUrl || defaultAvatarUrl" mode="aspectFill" @click="goUser" />
						<view class="author-main">
							<view class="author-name-row">
								<VipName class="author-name" :name="displayName" :is-member="!reviewMode && detail.authorIsMember" />
								<view v-if="!reviewMode && authorGenderIcon" class="gender-age-pill" :class="authorGenderClass">
									<image class="gender-age-icon" :src="authorGenderIcon" mode="aspectFit" />
									<text v-if="authorAge">{{ authorAge }}</text>
								</view>
							</view>
							<text class="post-time">{{ createdAtText }}</text>
						</view>
						<view v-if="!reviewMode && detail.followable" class="follow-btn" :class="{ followed }" @click="toggleFollow">{{ followed ? '已订阅' : '订阅' }}</view>
					</view>

					<view class="post-content">
						<rich-text v-if="hasRichContent" class="post-text" :nodes="detail.content"></rich-text>
						<text v-else-if="detail.content" class="post-text">{{ detail.content }}</text>
						<view v-else-if="detail.isSealed" class="state-box">
							<text class="state-title">这条想法正在封存中</text>
							<text class="state-desc">封存至 {{ sealedOpenDateText }}，到期前不可查看。</text>
						</view>
						<view v-else-if="isReviewing" class="state-box">
							<text class="state-title">内容审核中</text>
							<text class="state-desc">审核通过后，正文和图片才会展示。</text>
						</view>
					</view>

					<view v-if="imageUrls.length" :class="imageGridClass">
						<image
							v-for="(url, index) in imageUrls"
							:key="url + index"
							class="post-image"
							:src="url"
							mode="aspectFill"
							@click="previewImage(index)"
						/>
					</view>

					<view v-if="!reviewMode && tagList.length" class="tag-row">
						<text v-for="tag in tagList" :key="tag" class="tag-chip">{{ tag }}</text>
					</view>

					<view class="post-footer">
						<view class="action active">
							<text class="heart-icon">♥</text>
							<text>{{ detail.resonanceCount || 0 }}</text>
						</view>
						<view class="action" @click="openResonanceComposer()">
							<image class="comment-icon" src="/static/tab/message.png" mode="aspectFit" />
							<text>{{ totalCommentCount }}</text>
						</view>
						<view class="action" :class="{ 'favorite-active': isFavorited }" @click="toggleFavorite">
							<text class="star-icon">{{ isFavorited ? '★' : '☆' }}</text>
							<text>{{ favoriteCount }}</text>
						</view>
						<button class="action share-action" open-type="share" hover-class="none">
							<image class="share-icon" src="/static/img/share-icon.png" mode="aspectFit" />
							<text>{{ detail.shareCount || detail.share_count || 0 }}</text>
						</button>
					</view>
				</view>

				<view class="comment-card">
					<view class="section-head">
						<text class="section-title">全部评论（{{ totalCommentCount }}）</text>
						<view class="sort-entry">
							<text>最新</text>
							<text class="sort-arrow"></text>
						</view>
					</view>
					<view v-if="commentList.length" class="comment-list">
						<view v-for="item in commentList" :key="getCommentId(item)" class="comment-item">
							<image class="comment-avatar" :src="item.authorAvatarUrl || defaultAvatarUrl" mode="aspectFill" />
							<view class="comment-main">
								<view class="comment-meta">
									<view class="comment-name-row">
									<VipName class="comment-name" :name="getCommentAuthor(item)" :is-member="!reviewMode && item.authorIsMember" />
									<view v-if="!reviewMode && getCommentGenderIcon(item)" class="gender-age-pill small" :class="getCommentGenderClass(item)">
											<image class="gender-age-icon" :src="getCommentGenderIcon(item)" mode="aspectFit" />
											<text v-if="getCommentAge(item)">{{ getCommentAge(item) }}</text>
										</view>
										<text v-if="isAuthorComment(item)" class="author-mark">作者</text>
									</view>
									<view class="comment-like">
										<text>♡</text>
										<text>{{ item.likeCount || item.likes || 0 }}</text>
									</view>
								</view>
								<text class="comment-content">{{ item.content }}</text>
								<view class="comment-actions" @click="openResonanceComposer(item)">
									<text>{{ getCommentMeta(item) }}</text>
									<text class="reply-btn">回复</text>
								</view>
								<view v-if="getCommentReplies(item).length" class="reply-list">
									<view v-for="reply in getCommentReplies(item)" :key="getCommentId(reply)" class="reply-item">
										<view class="reply-meta">
											<view class="reply-name-row">
												<VipName class="reply-name" :name="getCommentAuthor(reply)" :is-member="!reviewMode && reply.authorIsMember" />
												<view v-if="!reviewMode && getCommentGenderIcon(reply)" class="gender-age-pill small" :class="getCommentGenderClass(reply)">
													<image class="gender-age-icon" :src="getCommentGenderIcon(reply)" mode="aspectFit" />
													<text v-if="getCommentAge(reply)">{{ getCommentAge(reply) }}</text>
												</view>
												<text v-if="isAuthorComment(reply)" class="author-mark">作者</text>
											</view>
											<view class="comment-like small">
												<text>♡</text>
												<text>{{ reply.likeCount || reply.likes || 0 }}</text>
											</view>
										</view>
										<text class="reply-content">{{ reply.content }}</text>
										<view class="reply-action-row">
											<text>{{ getCommentMeta(reply) }}</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view v-else class="comment-empty" @click="openResonanceComposer()">
						<text>暂时还没有共鸣，写下第一句吧</text>
					</view>
				</view>

				<view class="bottom-safe"></view>
			</view>
		</scroll-view>

		<view v-if="detail.id && detail.canInteract" class="bottom-bar">
			<view class="composer-entry" @click="openResonanceComposer()">{{ composerEntryText }}</view>
			<view class="bottom-action" @click="openResonanceComposer()">发送</view>
		</view>

		<view v-if="showResonanceComposer" class="sheet-mask" @click="closeResonanceComposer">
			<view class="composer-sheet" @click.stop>
				<view class="sheet-handle"></view>
				<view class="sheet-head">
					<text>{{ composerTitle }}</text>
					<text class="sheet-close" @click="closeResonanceComposer">关闭</text>
				</view>
				<textarea
					v-model="resonanceText"
					class="composer-textarea"
					:placeholder="composerPlaceholder"
					placeholder-class="textarea-placeholder"
					maxlength="120"
					:focus="showResonanceComposer"
				/>
				<view class="quick-list">
					<view
						v-for="item in quickComments"
						:key="item"
						class="quick-chip"
						:class="{ active: resonanceText === item }"
						@click="selectQuickComment(item)"
					>
						<text>{{ item }}</text>
					</view>
				</view>
				<view class="sheet-foot">
					<text>{{ resonanceText.length }} / 120</text>
					<view class="submit-btn" :class="{ disabled: !canSubmitResonance }" @click="submitResonance">
						{{ submittingResonance ? '发送中...' : '发送' }}
					</view>
				</view>
			</view>
		</view>

		<view v-if="showReportSheet" class="sheet-mask" @click="closeReportSheet">
			<view class="report-sheet" @click.stop>
				<view class="sheet-handle"></view>
				<view class="sheet-head">
					<text>举报内容</text>
					<text class="sheet-close" @click="closeReportSheet">关闭</text>
				</view>
				<view class="report-list">
					<view
						v-for="item in reportOptions"
						:key="item.value"
						class="report-option"
						:class="{ active: reportReason === item.value }"
						@click="selectReportReason(item.value)"
					>
						<text>{{ item.label }}</text>
					</view>
				</view>
				<textarea
					v-model="reportNote"
					class="report-textarea"
					placeholder="补充说明，可选"
					placeholder-class="textarea-placeholder"
					maxlength="200"
				/>
				<view class="sheet-foot">
					<text>{{ reportNote.length }} / 200</text>
					<view class="submit-btn" :class="{ disabled: !canSubmitReport }" @click="submitReport">
						{{ submittingReport ? '提交中...' : '提交举报' }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import {
	createThoughtComment,
	createThoughtReport,
	fetchThoughtDetail,
	toggleThoughtFavorite
} from '../../api/thought';
import { followUser, unfollowUser } from '../../api/follow';
import { COMMUNITY_SLOGO, DEFAULT_AVATAR_URL, SHARE_IMAGE_URL, SLOGO } from '../../config';
import { formatDateTime } from '../../utils/date';
import { showRequestError } from '../../utils/feedback';
import { isCommunityMode } from '../../utils/appMode';
import * as profileGuard from '../../utils/profileGuard';
import VipName from '../../components/VipName.vue';

const IMAGE_BASE = '/static/square/';

export default {
	components: { VipName },
	data() {
		return {
			reviewMode: true,
			defaultAvatarUrl: DEFAULT_AVATAR_URL,
			shareImageUrl: SHARE_IMAGE_URL,
			slogo: SLOGO,
			id: '',
			fromShare: false,
			loading: false,
			followed: false,
			detail: {},
			statusBarHeight: 44,
			headerTotalHeight: 96,
			showResonanceComposer: false,
			resonanceText: '',
			replyTarget: null,
			submittingResonance: false,
			showReportSheet: false,
			reportReason: '',
			reportNote: '',
			submittingReport: false,
			quickComments: [
				'我也拥有过这个念头',
				'这句话让我停了一下',
				'适合继续封存',
				'我想看它的改写版'
			],
			reportOptions: [
				{ value: 'spam', label: '广告或无意义内容' },
				{ value: 'harassment', label: '攻击、辱骂或骚扰' },
				{ value: 'illegal', label: '违法或危险内容' },
				{ value: 'privacy', label: '侵犯隐私或冒用身份' },
				{ value: 'uncomfortable', label: '令人不适的表达' },
				{ value: 'other', label: '其他问题' }
			]
		};
	},
	computed: {
		displayName() {
			return this.detail.authorNickname || this.detail.displayName || '想法来客';
		},
		authorGenderIcon() {
			return this.getGenderIcon(this.detail.authorGender || this.detail.gender || this.detail.sex);
		},
		authorAge() {
			return this.detail.authorAge || this.detail.age || '';
		},
		authorGenderClass() {
			return this.getGenderClass(this.detail.authorGender || this.detail.gender || this.detail.sex);
		},
		visibilityLabel() {
			if (this.detail.visibility === 'private') return '仅自己可见';
			return '公开展示身份';
		},
		createdAtText() {
			return this.detail.createdAt ? formatDateTime(this.detail.createdAt) : this.visibilityLabel;
		},
		imageUrls() {
			return (this.detail.images || [])
				.map((item) => (typeof item === 'string' ? item : item.url))
				.filter(Boolean);
		},
		tagList() {
			const list = [];
			if (this.detail.topicTitle) list.push(this.detail.topicTitle);
			if (Array.isArray(this.detail.tags)) list.push(...this.detail.tags);
			return list;
		},
		commentList() {
			const comments = Array.isArray(this.detail.comments) ? this.detail.comments : [];
			return comments.filter((item) => !this.hasKnownParentComment(item, comments));
		},
		totalCommentCount() {
			return this.commentList.reduce((count, item) => count + 1 + this.getCommentReplies(item).length, 0);
		},
		canSubmitResonance() {
			return Boolean(this.resonanceText.trim()) && !this.submittingResonance;
		},
		composerTitle() {
			return this.replyTarget ? `回复 ${this.getCommentAuthor(this.replyTarget)}` : '写下共鸣';
		},
		composerPlaceholder() {
			return this.replyTarget ? `回复 ${this.getCommentAuthor(this.replyTarget)}` : '写下一句刚好被它照到的话';
		},
		composerEntryText() {
			return this.replyTarget ? `回复 ${this.getCommentAuthor(this.replyTarget)}` : '写下共鸣...';
		},
		favoriteCount() {
			return this.detail.favoriteCount || this.detail.favorites || this.detail.favorite_count || 0;
		},
		isFavorited() {
			return Boolean(this.detail.isFavorited || this.detail.favorited);
		},
		canSubmitReport() {
			return Boolean(this.reportReason) && !this.submittingReport;
		},
		hasRichContent() {
			return /<\/?[a-z][\s\S]*>/i.test(this.detail.content || '');
		},
		isReviewing() {
			return this.detail && (
				this.detail.status === 'reviewing' ||
				(this.detail.auditStatus && this.detail.auditStatus !== 'approved')
			);
		},
		imageGridClass() {
			if (this.imageUrls.length === 1) return 'image-grid one';
			if (this.imageUrls.length === 2) return 'image-grid two';
			return 'image-grid many';
		},
		shareTitle() {
			const plainContent = String(this.detail.content || '').replace(/<[^>]+>/g, '').trim();
			if (plainContent) return plainContent.length > 28 ? `${plainContent.slice(0, 28)}...` : plainContent;
			return `${this.displayName}的想法`;
		},
		sealedOpenDateText() {
			return this.detail.openAt ? formatDateTime(this.detail.openAt).split(' ')[0].replace(/-/g, '.') : '未来某一天';
		}
	},
	onLoad(query = {}) {
		this.reviewMode = isCommunityMode();
		this.slogo = this.reviewMode ? COMMUNITY_SLOGO : SLOGO;
		this.setHeaderLayout();
		this.id = query.id || '';
		this.fromShare = query.from === 'share';
		this.loadDetail();
	},
	onShow() {
		this.reviewMode = isCommunityMode();
		this.slogo = this.reviewMode ? COMMUNITY_SLOGO : SLOGO;
		if (this.id) this.loadDetail();
	},
	onShareAppMessage() {
		const shareId = this.id || this.detail.id || '';
		return {
			title: this.shareTitle || this.slogo,
			path: `/pages/detail/index?id=${encodeURIComponent(shareId)}&from=share`,
			imageUrl: this.shareImageUrl
		};
	},
	methods: {
		formatDateTime,
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
		async loadDetail() {
			if (!this.id) {
				this.detail = this.createFallbackDetail('');
				return;
			}

			this.loading = true;
			try {
				this.detail = (await fetchThoughtDetail(this.id)) || {};
				if (!this.detail.id) this.detail = this.createFallbackDetail(this.id);
				this.followed = Boolean(this.detail.followed);
			} catch (error) {
				this.detail = this.createFallbackDetail(this.id);
				this.followed = false;
			} finally {
				this.loading = false;
			}
		},
		createFallbackDetail(id) {
			const fallbackMap = {
				life_001: {
					content: '有一个念头我永远不会真的说出口。\n但它确实存在过，像一封没有寄出的信。',
					tags: ['禁忌', '秘密'],
					images: [`${IMAGE_BASE}sunset-lake.jpg`, `${IMAGE_BASE}evening-pier.jpg`, `${IMAGE_BASE}coffee-sunset.jpg`],
					authorNickname: '心语来客',
					authorGender: '女',
					authorAge: 22,
					favorites: 56,
					resonanceCount: 128
				},
				life_002: {
					content: '如果人生可以重开一次，我想成为一个完全相反的人。\n不是更好，只是更真实。',
					tags: ['平行世界', '幻想'],
					images: [`${IMAGE_BASE}mountain-sign.jpg`, `${IMAGE_BASE}green-hills.jpg`, `${IMAGE_BASE}trail-view.jpg`],
					authorNickname: '平行剧本',
					authorGender: '男',
					authorAge: 24,
					favorites: 42,
					resonanceCount: 96
				}
			};
			const base = fallbackMap[id] || fallbackMap.life_001;
			return {
				id: id || 'fallback_detail',
				authorId: '',
				authorAvatarUrl: DEFAULT_AVATAR_URL,
				createdAt: new Date().toISOString(),
				canInteract: true,
				shareCount: 18,
				comments: [
					{
						id: 'c1',
						authorNickname: '深夜读者',
						authorGender: '女',
						authorAge: 22,
						city: '广东',
						likeCount: 12,
						authorAvatarUrl: DEFAULT_AVATAR_URL,
						content: '这句话让我停了一下。',
						createdAt: new Date().toISOString(),
						replies: [
							{
								id: 'r1',
								parentId: 'c1',
								rootCommentId: 'c1',
								replyToName: '深夜读者',
								authorNickname: '温柔回声',
								authorGender: '女',
								authorAge: 22,
								isAuthor: true,
								city: '深圳',
								likeCount: 6,
								authorAvatarUrl: DEFAULT_AVATAR_URL,
								content: '像是把心里的声音放轻了一点。',
								createdAt: new Date().toISOString()
							}
						]
					},
					{
						id: 'c2',
						authorNickname: '未寄信人',
						authorGender: '男',
						authorAge: 26,
						city: '浙江',
						likeCount: 5,
						authorAvatarUrl: DEFAULT_AVATAR_URL,
						content: '我也有过类似的念头。',
						createdAt: new Date().toISOString()
					}
				],
				visibility: 'public_named',
				...base
			};
		},
		goBack() {
			const pages = getCurrentPages();
			if (this.fromShare || pages.length <= 1) {
				this.backToList();
				return;
			}
			uni.navigateBack({ fail: () => this.backToList() });
		},
		backToList() {
			uni.switchTab({ url: '/pages/square/index' });
		},
		goUser() {
			if (this.reviewMode) return;
			uni.navigateTo({ url: `/pages/user/index?id=${encodeURIComponent(this.detail.authorId || this.detail.id || '')}` });
		},
		previewImage(index) {
			const urls = this.imageUrls;
			if (!urls.length) return;
			uni.previewImage({ current: urls[index], urls });
		},
		getCommentId(item = {}) {
			return item.id || item.commentId || item._id || `${item.createdAt || ''}_${item.content || ''}`;
		},
		getCommentAuthor(item) {
			return item.authorNickname || item.authorStampNo || '想法来客';
		},
		getGenderType(gender = '') {
			if (gender === '男' || gender === 'male' || gender === 1) return 'male';
			if (gender === '女' || gender === 'female' || gender === 2) return 'female';
			return '';
		},
		getGenderIcon(gender = '') {
			const type = this.getGenderType(gender);
			if (type === 'male') return '/static/img/nan-icon.png';
			if (type === 'female') return '/static/img/nv-icon.png';
			return '';
		},
		getGenderClass(gender = '') {
			return this.getGenderType(gender);
		},
		getCommentGenderIcon(item = {}) {
			return this.getGenderIcon(item.authorGender || item.gender || item.sex);
		},
		getCommentGenderClass(item = {}) {
			return this.getGenderClass(item.authorGender || item.gender || item.sex);
		},
		getCommentAge(item = {}) {
			return item.authorAge || item.age || '';
		},
		getCommentMeta(item = {}) {
			const time = item.createdAt ? formatDateTime(item.createdAt) : '';
			const location = item.city || item.province || item.location || '';
			return [time, location].filter(Boolean).join(' · ');
		},
		isAuthorComment(item = {}) {
			const authorId = this.detail.authorId || this.detail.userId;
			return Boolean(
				item.isAuthor ||
				(authorId && (item.authorId === authorId || item.userId === authorId))
			);
		},
		getNestedReplies(item = {}) {
			return [item.replies, item.children, item.replyList].reduce((result, list) => {
				if (Array.isArray(list)) result.push(...list);
				return result;
			}, []);
		},
		getParentCandidateIds(item = {}) {
			return [
				item.rootCommentId,
				item.rootId,
				item.parentId,
				item.parentCommentId,
				item.replyToCommentId,
				item.replyCommentId
			].filter(Boolean).map(String);
		},
		hasKnownParentComment(item, comments = []) {
			const itemId = String(this.getCommentId(item));
			const parentIds = this.getParentCandidateIds(item);
			if (!parentIds.length) return false;
			return comments.some((parent) => {
				const parentId = String(this.getCommentId(parent));
				return parentId !== itemId && parentIds.includes(parentId);
			});
		},
		getCommentReplies(item = {}) {
			const rootId = String(this.getCommentId(item));
			const replies = [...this.getNestedReplies(item)];
			const comments = Array.isArray(this.detail.comments) ? this.detail.comments : [];
			comments.forEach((child) => {
				if (String(this.getCommentId(child)) === rootId) return;
				if (this.getParentCandidateIds(child).includes(rootId)) replies.push(child);
			});
			const seen = new Set();
			return replies.filter((reply) => {
				const id = String(this.getCommentId(reply));
				if (seen.has(id)) return false;
				seen.add(id);
				return true;
			});
		},
		getReplyRootId(target = {}) {
			return target.rootCommentId || target.rootId || target.__rootCommentId || this.getCommentId(target);
		},
		async toggleFollow() {
			if (!this.detail.followable || !this.detail.authorId) return;
			if (!(await profileGuard.ensureProfileCompleted({ actionText: '订阅' }))) return;
			const nextFollowed = !this.followed;
			this.followed = nextFollowed;
			try {
				if (nextFollowed) {
					await followUser(this.detail.authorId);
					uni.showToast({ title: '已订阅', icon: 'none' });
				} else {
					await unfollowUser(this.detail.authorId);
					uni.showToast({ title: '已取关', icon: 'none' });
				}
			} catch (error) {
				this.followed = !nextFollowed;
				showRequestError(error, nextFollowed ? '订阅失败' : '取消订阅失败');
			}
		},
		async toggleFavorite() {
			if (!this.detail.id) return;
			if (!(await profileGuard.ensureProfileCompleted({ actionText: '收藏' }))) return;
			if (!this.detail.canInteract) {
				uni.showToast({ title: '这条内容暂时不能收藏', icon: 'none' });
				return;
			}

			const previousFavorited = this.isFavorited;
			const previousCount = Number(this.favoriteCount || 0);
			const nextFavorited = !previousFavorited;
			this.detail = {
				...this.detail,
				isFavorited: nextFavorited,
				favoriteCount: Math.max(0, previousCount + (nextFavorited ? 1 : -1))
			};

			if (this.isLocalDetail()) {
				uni.showToast({ title: nextFavorited ? '已收藏' : '已取消收藏', icon: 'none' });
				return;
			}

			try {
				const response = await toggleThoughtFavorite(this.detail.id);
				if (response && typeof response === 'object') {
					const nextFavoriteCount = response.favoriteCount !== undefined ? response.favoriteCount : response.favorites;
					this.detail = {
						...this.detail,
						...response,
						isFavorited: Boolean(response.isFavorited || response.favorited),
						favoriteCount: nextFavoriteCount !== undefined ? nextFavoriteCount : this.detail.favoriteCount
					};
				}
				uni.showToast({ title: this.isFavorited ? '已收藏' : '已取消收藏', icon: 'none' });
			} catch (error) {
				this.detail = {
					...this.detail,
					isFavorited: previousFavorited,
					favoriteCount: previousCount
				};
				showRequestError(error, nextFavorited ? '收藏失败' : '取消收藏失败');
			}
		},
		async openResonanceComposer(target = null) {
			if (!(await profileGuard.ensureProfileCompleted({ actionText: '评论' }))) return;
			if (!this.detail.canInteract) {
				uni.showToast({ title: '这条内容暂时不能产生共鸣', icon: 'none' });
				return;
			}
			this.replyTarget = target && this.getCommentId(target) ? target : null;
			this.showResonanceComposer = true;
		},
		closeResonanceComposer() {
			if (!this.submittingResonance) {
				this.showResonanceComposer = false;
				this.replyTarget = null;
			}
		},
		selectQuickComment(content) {
			this.resonanceText = content;
		},
		isLocalDetail() {
			return String(this.id).startsWith('life_') || this.id === '' || this.detail.id === 'fallback_detail';
		},
		buildReplyPayload(target) {
			if (!target) return {};
			return {
				parentId: this.getCommentId(target),
				rootCommentId: this.getReplyRootId(target),
				replyToNickname: this.getCommentAuthor(target)
			};
		},
		appendLocalComment(content, target = null, source = {}) {
			const comments = Array.isArray(this.detail.comments) ? [...this.detail.comments] : [];
			const baseComment = {
				id: `local_${Date.now()}`,
				authorNickname: '我',
				authorAvatarUrl: DEFAULT_AVATAR_URL,
				content,
				createdAt: new Date().toISOString(),
				...source
			};
			if (!target) {
				this.detail = { ...this.detail, comments: [...comments, baseComment] };
				return;
			}

			const rootId = String(this.getReplyRootId(target));
			const rootIndex = comments.findIndex((item) => String(this.getCommentId(item)) === rootId);
			const reply = {
				...baseComment,
				parentId: this.getCommentId(target),
				rootCommentId: rootId,
				replyToName: this.getCommentAuthor(target)
			};
			if (rootIndex === -1) {
				this.detail = { ...this.detail, comments: [...comments, reply] };
				return;
			}
			const rootComment = { ...comments[rootIndex] };
			rootComment.replies = [...this.getNestedReplies(rootComment), reply];
			comments.splice(rootIndex, 1, rootComment);
			this.detail = { ...this.detail, comments };
		},
		async submitResonance() {
			if (!this.canSubmitResonance) return;
			const content = this.resonanceText.trim();
			const target = this.replyTarget;
			this.submittingResonance = true;
			try {
				if (this.isLocalDetail()) {
					this.appendLocalComment(content, target);
					this.detail.resonanceCount = (this.detail.resonanceCount || 0) + 1;
				} else {
					const response = await createThoughtComment(this.id, content, this.buildReplyPayload(target));
					if (response && Array.isArray(response.comments)) {
						this.detail = response;
					} else if (response && response.id && response.content && !Array.isArray(response.images) && !response.visibility) {
						this.appendLocalComment(content, target, response);
					} else if (response && response.id) {
						this.detail = response;
					} else {
						this.appendLocalComment(content, target);
					}
				}
				this.resonanceText = '';
				this.replyTarget = null;
				this.showResonanceComposer = false;
				uni.showToast({ title: target ? '回复已送达' : '共鸣已送达', icon: 'success' });
			} catch (error) {
				showRequestError(error, '共鸣发送失败');
			} finally {
				this.submittingResonance = false;
			}
		},
		async openReportSheet() {
			if (!this.detail.id) return;
			if (!(await profileGuard.ensureProfileCompleted({ actionText: '举报' }))) return;
			this.showReportSheet = true;
		},
		closeReportSheet() {
			if (!this.submittingReport) this.showReportSheet = false;
		},
		selectReportReason(value) {
			this.reportReason = value;
		},
		async submitReport() {
			if (!(await profileGuard.ensureProfileCompleted({ actionText: '举报' }))) return;
			if (!this.canSubmitReport) {
				uni.showToast({ title: '请选择举报原因', icon: 'none' });
				return;
			}
			this.submittingReport = true;
			try {
				if (this.id && !String(this.id).startsWith('life_')) {
					await createThoughtReport(this.id, { reason: this.reportReason, note: this.reportNote.trim() });
				}
				this.showReportSheet = false;
				this.reportReason = '';
				this.reportNote = '';
				uni.showToast({ title: '已收到举报', icon: 'success' });
			} catch (error) {
				showRequestError(error, '举报提交失败');
			} finally {
				this.submittingReport = false;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.detail-page {
	min-height: 100vh;
	background:
		radial-gradient(circle at 70% 0, rgba(212, 104, 138, 0.08), transparent 280rpx),
		linear-gradient(180deg, #fffafd 0%, #ffffff 44%, #fffafd 100%);
	overflow: hidden;
}

.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 20;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 92rpx;
	padding-left: 22rpx;
	padding-right: 28rpx;
	box-sizing: content-box;
	background: rgba(255, 250, 253, 0.78);
	backdrop-filter: blur(14rpx);
}

.back-btn,
.more-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.78);
	border: 1rpx solid rgba(222, 213, 230, 0.9);
	color: #d4688a;
	font-weight: 900;
	box-shadow: 0 8rpx 18rpx rgba(212, 104, 138, 0.06);
	box-sizing: border-box;
}

.back-btn {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
}

.back-arrow {
	width: 16rpx;
	height: 16rpx;
	border-left: 4rpx solid #d4688a;
	border-bottom: 4rpx solid #d4688a;
	transform: rotate(45deg);
	margin-left: 6rpx;
}

.more-btn {
	min-width: 70rpx;
	height: 54rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	font-size: 24rpx;
}

.nav-title {
	color: #24284f;
	font-size: 30rpx;
	font-weight: 900;
}

.detail-scroll {
	height: 100vh;
	box-sizing: border-box;
}

.content-wrap,
.skeleton-page {
	padding: 18rpx 16rpx 0;
}

.post-card,
.comment-card,
.skeleton-card {
	border-radius: 18rpx;
	background: rgba(255, 255, 255, 0.96);
	border: 1rpx solid rgba(241, 232, 240, 0.9);
	box-shadow: 0 8rpx 24rpx rgba(142, 112, 152, 0.055);
}

.post-card {
	padding: 28rpx 24rpx 22rpx;
}

.author-row,
.post-footer,
.action,
.section-head,
.comment-item,
.comment-meta,
.sheet-head,
.sheet-foot {
	display: flex;
	align-items: center;
}

.author-row {
	gap: 18rpx;
}

.author-avatar,
.comment-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: #f6f1f7;
	flex-shrink: 0;
}

.author-main {
	flex: 1;
	min-width: 0;
}

.author-name-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
	min-width: 0;
}

.author-name {
	display: inline-block;
	max-width: 360rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #24284f;
	font-size: 30rpx;
	font-weight: 900;
	line-height: 1;
}

.post-time {
	display: block;
	margin-top: 9rpx;
	color: #aaa3bd;
	font-size: 21rpx;
	line-height: 1;
}

.follow-btn {
	height: 46rpx;
	padding: 0 22rpx;
	border-radius: 999rpx;
	border: 1rpx solid rgba(212, 104, 138, 0.36);
	color: #d4688a;
	font-size: 22rpx;
	font-weight: 900;
	line-height: 46rpx;
}

.follow-btn.followed {
	background: #fff0f7;
	border-color: rgba(212, 104, 138, 0.18);
}

.post-content {
	margin-top: 28rpx;
}

.post-text {
	display: block;
	color: #2d2e34;
	font-size: 28rpx;
	line-height: 1.68;
	white-space: pre-line;
}

.state-box {
	padding: 28rpx;
	border-radius: 18rpx;
	background: #fffafd;
	border: 1rpx solid rgba(241, 232, 240, 0.9);
}

.state-title,
.state-desc {
	display: block;
}

.state-title {
	color: #24284f;
	font-size: 28rpx;
	font-weight: 900;
}

.state-desc {
	margin-top: 12rpx;
	color: #8f89a1;
	font-size: 24rpx;
}

.image-grid {
	display: grid;
	gap: 12rpx;
	margin-top: 24rpx;
}

.image-grid.one {
	grid-template-columns: 1fr;
}

.image-grid.two {
	grid-template-columns: repeat(2, 1fr);
}

.image-grid.many {
	grid-template-columns: repeat(3, 1fr);
}

.post-image {
	width: 100%;
	height: 206rpx;
	border-radius: 14rpx;
	background: #f6f1f7;
}

.image-grid.one .post-image {
	height: 430rpx;
}

.tag-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 22rpx;
}

.tag-chip {
	height: 40rpx;
	padding: 0 16rpx;
	border-radius: 999rpx;
	background: #fbf3f8;
	color: #9f93aa;
	font-size: 21rpx;
	font-weight: 800;
	line-height: 40rpx;
}

.post-footer {
	justify-content: space-around;
	margin: 28rpx -24rpx -22rpx;
	padding: 20rpx 12rpx;
	border-top: 1rpx solid rgba(242, 237, 245, 0.92);
	color: #8f89a1;
	background: #ffffff;
}

.action {
	justify-content: center;
	gap: 8rpx;
	min-width: 120rpx;
	height: 42rpx;
	font-size: 23rpx;
	font-weight: 800;
}

.action.active {
	color: #ef7ead;
}

.action.favorite-active,
.action.favorite-active .star-icon {
	color: #ef7ead;
}

.heart-icon {
	font-size: 34rpx;
	line-height: 1;
}

.star-icon {
	color: #8f89a1;
	font-size: 34rpx;
	line-height: 1;
}

.comment-icon {
	width: 34rpx;
	height: 34rpx;
	flex-shrink: 0;
}

.share-action {
	margin: 0;
	padding: 0;
	border: 0;
	background: transparent;
	color: inherit;
	line-height: 1;
}

.share-action::after {
	display: none;
}

.share-icon {
	width: 34rpx;
	height: 34rpx;
	flex-shrink: 0;
}

.comment-card {
	margin-top: 14rpx;
	padding: 26rpx 20rpx 12rpx;
	border-radius: 0;
	border-left: 0;
	border-right: 0;
	box-shadow: none;
	background: rgba(255, 255, 255, 0.98);
}

.section-head {
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.section-title {
	color: #24284f;
	font-size: 27rpx;
	font-weight: 900;
}

.sort-entry {
	display: flex;
	align-items: center;
	gap: 8rpx;
	color: #aaa3bd;
	font-size: 22rpx;
}

.sort-arrow {
	width: 10rpx;
	height: 10rpx;
	border-right: 2rpx solid currentColor;
	border-bottom: 2rpx solid currentColor;
	transform: rotate(45deg);
	margin-top: -4rpx;
}

.comment-list {
	display: flex;
	flex-direction: column;
}

.comment-item {
	align-items: flex-start;
	gap: 16rpx;
	padding: 22rpx 0;
}

.comment-item + .comment-item {
	border-top: 1rpx solid #f2edf5;
}

.comment-avatar {
	width: 64rpx;
	height: 64rpx;
}

.comment-main {
	flex: 1;
	min-width: 0;
}

.comment-meta {
	justify-content: space-between;
	gap: 14rpx;
}

.comment-name-row,
.reply-name-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8rpx;
	min-width: 0;
}

.comment-name {
	color: #24284f;
	font-size: 25rpx;
	font-weight: 900;
}

.author-mark {
	height: 26rpx;
	padding: 0 8rpx;
	border-radius: 6rpx;
	font-size: 18rpx;
	font-weight: 900;
	line-height: 26rpx;
}

.author-mark {
	background: rgba(239, 159, 192, 0.18);
	color: #d4688a;
}

.gender-age-pill {
	display: flex;
	align-items: center;
	gap: 4rpx;
	height: 30rpx;
	padding: 0 10rpx;
	border-radius: 15rpx;
	font-size: 18rpx;
	font-weight: 700;
	line-height: 30rpx;
	flex-shrink: 0;
}

.gender-age-pill.small {
	height: 28rpx;
	padding: 0 9rpx;
	border-radius: 14rpx;
	font-size: 17rpx;
	line-height: 28rpx;
}

.gender-age-pill.female {
	background: #fff0f6;
	color: #ef6f9f;
}

.gender-age-pill.male {
	background: #f4f0ff;
	color: #8875d6;
}

.gender-age-icon {
	width: 18rpx;
	height: 18rpx;
	flex-shrink: 0;
}

.comment-like {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rpx;
	min-width: 38rpx;
	color: #aaa3bd;
	font-size: 19rpx;
	line-height: 1;
	flex-shrink: 0;
}

.comment-like text:first-child {
	font-size: 32rpx;
	line-height: 1;
}

.comment-like.small text:first-child {
	font-size: 28rpx;
}

.comment-content {
	display: block;
	margin-top: 8rpx;
	color: #4f4664;
	font-size: 26rpx;
	line-height: 1.55;
}

.comment-actions,
.reply-action-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-top: 9rpx;
	color: #b8b1c4;
	font-size: 20rpx;
}

.reply-btn {
	color: #d4688a;
	font-weight: 400;
}

.reply-btn.small {
	font-size: 20rpx;
}

.reply-list {
	margin-top: 16rpx;
	padding: 4rpx 20rpx;
	border-radius: 16rpx;
	background: linear-gradient(180deg, #fffafd 0%, #faf7fb 100%);
	border: 1rpx solid rgba(242, 237, 245, 0.9);
}

.reply-item {
	padding: 16rpx 0;
}

.reply-item + .reply-item {
	border-top: 1rpx solid rgba(242, 237, 245, 0.9);
}

.reply-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 14rpx;
}

.reply-name {
	color: #24284f;
	font-size: 23rpx;
	font-weight: 900;
}

.reply-content {
	display: block;
	margin-top: 8rpx;
	color: #4f4664;
	font-size: 24rpx;
	line-height: 1.52;
}

.comment-empty,
.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #aaa3bd;
	font-size: 24rpx;
}

.comment-empty {
	min-height: 120rpx;
	border-radius: 16rpx;
	background: #fffafd;
}

.empty-state {
	flex-direction: column;
	padding-top: 180rpx;
}

.empty-state image {
	width: 180rpx;
	height: 180rpx;
	margin-bottom: 18rpx;
}

.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 30;
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding: 14rpx 20rpx calc(14rpx + env(safe-area-inset-bottom));
	background: rgba(255, 255, 255, 0.97);
	border-top: 1rpx solid rgba(238, 232, 242, 0.82);
	box-sizing: border-box;
}

.composer-entry,
.bottom-action {
	height: 64rpx;
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	font-size: 24rpx;
	font-weight: 900;
}

.composer-entry {
	flex: 1;
	justify-content: flex-start;
	padding: 0 26rpx;
	background: #f8f5f9;
	border: 1rpx solid rgba(242, 237, 245, 0.96);
	color: #aaa3bd;
	font-weight: 700;
}

.bottom-action {
	width: 112rpx;
	background: linear-gradient(135deg, #d4688a, #ef9fc0);
	color: #ffffff;
	box-shadow: 0 10rpx 22rpx rgba(212, 104, 138, 0.18);
}

.sheet-mask {
	position: fixed;
	inset: 0;
	z-index: 80;
	display: flex;
	align-items: flex-end;
	background: rgba(36, 40, 79, 0.22);
}

.composer-sheet,
.report-sheet {
	width: 100%;
	max-height: 82vh;
	padding: 18rpx 28rpx calc(34rpx + env(safe-area-inset-bottom));
	border-radius: 24rpx 24rpx 0 0;
	background: #fffafd;
	box-sizing: border-box;
}

.sheet-handle {
	width: 72rpx;
	height: 8rpx;
	margin: 0 auto 22rpx;
	border-radius: 999rpx;
	background: #eadfea;
}

.sheet-head {
	justify-content: space-between;
	color: #24284f;
	font-size: 31rpx;
	font-weight: 900;
}

.sheet-close {
	color: #d4688a;
	font-size: 24rpx;
}

.composer-textarea,
.report-textarea {
	width: 100%;
	height: 180rpx;
	margin-top: 22rpx;
	padding: 22rpx;
	border-radius: 18rpx;
	background: #ffffff;
	border: 1rpx solid rgba(222, 213, 230, 0.9);
	color: #2d2e34;
	font-size: 26rpx;
	box-sizing: border-box;
}

.textarea-placeholder {
	color: #aaa3bd;
}

.quick-list,
.report-list {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	margin-top: 18rpx;
}

.quick-chip,
.report-option {
	height: 50rpx;
	padding: 0 20rpx;
	border-radius: 999rpx;
	background: #ffffff;
	border: 1rpx solid rgba(222, 213, 230, 0.9);
	color: #766e86;
	font-size: 23rpx;
	font-weight: 800;
	line-height: 50rpx;
}

.quick-chip.active,
.report-option.active {
	background: #fff0f7;
	border-color: rgba(212, 104, 138, 0.36);
	color: #d4688a;
}

.sheet-foot {
	justify-content: space-between;
	margin-top: 22rpx;
	color: #aaa3bd;
	font-size: 22rpx;
}

.submit-btn {
	min-width: 140rpx;
	height: 58rpx;
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #d4688a, #ef9fc0);
	color: #ffffff;
	font-size: 24rpx;
	font-weight: 900;
}

.submit-btn.disabled {
	opacity: 0.45;
}

.skeleton-card {
	padding: 28rpx 24rpx;
}

.skeleton-head {
	display: flex;
	align-items: center;
	gap: 18rpx;
	margin-bottom: 22rpx;
}

.skeleton-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
}

.skeleton-lines {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.skeleton-line {
	height: 22rpx;
	border-radius: 999rpx;
}

.skeleton-line.short {
	width: 160rpx;
}

.skeleton-line.tiny {
	width: 112rpx;
}

.skeleton-line.full {
	width: 88%;
	margin-top: 16rpx;
}

.skeleton-image {
	height: 280rpx;
	margin-top: 22rpx;
	border-radius: 16rpx;
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

.bottom-safe {
	height: calc(126rpx + env(safe-area-inset-bottom));
}
</style>
