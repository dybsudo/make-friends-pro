<template>
	<view class="thought-page tab-page profile-page">
		<view class="page-body profile-body" :style="{ paddingTop: profileTopPadding + 'px' }">
			<view class="profile-card">
				<view class="profile-main">
					<view class="avatar-wrap" @click="chooseAvatar">
						<image class="profile-avatar" :src="user.avatarUrl || '/static/touxiang.png'" mode="aspectFill" />
						<view class="avatar-edit-badge"><text class="avatar-edit-icon">✦</text></view>
					</view>
					<view class="profile-copy">
						<view class="name-row" @click="startEditName">
							<VipName class="profile-name" :name="user.nickname || '想法来客'" :is-member="!reviewMode && membership.isMember" />
							<view v-if="!reviewMode" class="age-pill"><text>{{ ageText }}</text></view>
						</view>
						<view v-if="!reviewMode" class="intro-row" @click="goProfileComplete">
							<text class="profile-intro">{{ user.intro || '喜欢记录生活，也愿意分享每一点成长' }}</text>
							<text class="edit-mini">✎</text>
						</view>
						<view v-if="!reviewMode" class="tag-row">
							<text class="tag-chip tag-purple">INTJ</text>
							<text class="tag-chip tag-blue">摄影</text>
							<text class="tag-chip tag-yellow">音乐</text>
							<text v-if="user.city" class="tag-chip tag-mint">{{ user.city }}</text>
							<text v-else class="tag-add" @click.stop="goProfileComplete">＋</text>
						</view>
					</view>
				</view>

				<view v-if="!reviewMode" class="profile-stats">
					<view class="profile-stat stat-clickable" @click="goMyRecords">
						<text class="stat-value">{{ stats.total }}</text>
						<text class="stat-label">动态</text>
					</view>
					<view class="stat-sep" />
					<view class="profile-stat stat-clickable" @click="goFollow('following')">
						<text class="stat-value">{{ stats.followingCount }}</text>
						<text class="stat-label">订阅</text>
					</view>
					<view class="stat-sep" />
					<view class="profile-stat stat-clickable" @click="goFollow('followers')">
						<text class="stat-value">{{ stats.followerCount }}</text>
						<text class="stat-label">读者</text>
					</view>
					<view class="stat-sep" />
					<view class="profile-stat stat-clickable" @click="goCharm">
						<text class="stat-value">{{ user.charmValue || 0 }}</text>
						<text class="stat-label">魅力值</text>
					</view>
				</view>
				<view v-else class="profile-stats review-profile-stats">
					<view class="profile-stat stat-clickable" @click="goMyRecords">
						<text class="stat-value">{{ stats.total }}</text>
						<text class="stat-label">我的动态</text>
					</view>
				</view>
			</view>

			<view v-if="!reviewMode" class="quick-card">
				<view class="quick-item" @click="goMyRecords">
					<view class="quick-icon heart-icon">♥</view>
					<text class="quick-title">我的动态</text>
				</view>
				<view class="quick-item" @click="goFavorites">
					<view class="quick-icon chat-icon">•••</view>
					<text class="quick-title">我的收藏</text>
				</view>
				<view class="quick-item" @click="goTasks">
					<view class="quick-icon star-icon">★</view>
					<text class="quick-title">我的任务</text>
				</view>
				<view class="quick-item" @click="goGiftGallery">
					<view class="quick-icon user-icon">♟</view>
					<text class="quick-title">我的礼物馆</text>
				</view>
			</view>
			<view v-else class="quick-card review-quick-card">
				<view class="quick-item" @click="goMyRecords">
					<view class="quick-icon heart-icon">♥</view>
					<text class="quick-title">我的动态</text>
				</view>
				<view class="quick-item" @click="goFavorites">
					<view class="quick-icon star-icon">★</view>
					<text class="quick-title">我的收藏</text>
				</view>
			</view>

			<view v-if="!reviewMode" class="member-card" @click="goMembership">
				<view class="member-left">
					<view class="crown-icon">♛</view>
					<view class="member-copy">
						<text class="member-title">{{ membership.isMember ? '会员进行中' : '轻享会员' }}</text>
						<text class="member-sub">{{ membership.isMember ? `有效期至 ${formatMembershipDate(membership.expiresAt)}` : '解锁更多记录和专属权益' }}</text>
					</view>
				</view>
				<view class="member-btn">
					<text>{{ membership.isMember ? '查看权益' : '去开通' }}</text>
					<text class="member-arrow">›</text>
				</view>
			</view>

			<!-- 菜单 -->
			<view v-if="!reviewMode" class="menu-card">
				<view class="menu-row" @click="goDiamonds">
					<view class="menu-row-left">
						<text class="menu-row-emoji">💎</text>
						<text>我的钻石</text>
					</view>
					<view class="menu-row-right">
						<image class="diamond-mini-icon" src="/static/img/zuanshi.png" mode="aspectFit" />
						<text class="menu-note">{{ diamondBalance }}</text>
						<text class="menu-arrow">›</text>
					</view>
				</view>
				<view class="menu-row" @click="showComingSoon('成就徽章')">
					<view class="menu-row-left">
						<text class="menu-row-emoji">🏅</text>
						<text>成就徽章</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				<view class="menu-row" @click="showComingSoon('个性装扮')">
					<view class="menu-row-left">
						<text class="menu-row-emoji">👗</text>
						<text>个性装扮</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				<button class="menu-row customer-row" open-type="contact" hover-class="menu-row-hover">
					<view class="menu-row-left">
						<text class="menu-row-emoji">🎧</text>
						<text>在线客服</text>
					</view>
					<text class="menu-arrow">›</text>
				</button>
				<view class="menu-row" @click="goAbout">
					<view class="menu-row-left">
						<text class="menu-row-emoji">ℹ️</text>
						<text>关于我们</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
			</view>
			<view v-else class="menu-card">
				<view class="menu-row" @click="goProfileComplete">
					<view class="menu-row-left">
						<text class="menu-row-emoji">✎</text>
						<text>编辑资料</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				<view class="menu-row" @click="goAbout">
					<view class="menu-row-left">
						<text class="menu-row-emoji">i</text>
						<text>关于我们</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
			</view>

		</view>
		<ReviewTabBar v-if="reviewMode" active="profile" />

		<view v-if="isEditingName" class="name-popup-mask" @click="cancelEdit">
			<view class="name-popup" @click.stop>
				<text class="popup-title">修改昵称</text>
				<input
					class="popup-input"
					v-model="editNickname"
					placeholder="请输入昵称"
					placeholder-class="popup-placeholder"
					maxlength="20"
					:focus="isEditingName"
				/>
				<view class="popup-actions">
					<view class="popup-btn popup-cancel" @click="cancelEdit"><text>取消</text></view>
					<view class="popup-btn popup-save" @click="saveNickname"><text>{{ isSaving ? '保存中…' : '保存' }}</text></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { fetchMyThoughts } from '../../api/thought';
import { fetchCurrentUser, updateProfile } from '../../api/user';
import { DEFAULT_PROFILE_NAME } from '../../config';
import { showRequestError } from '../../utils/feedback';
import { uploadImage } from '../../utils/request';
import { refreshCachedUser } from '../../utils/auth';
import { fetchDiamonds } from '../../api/diamond';
import { fetchMembership } from '../../api/membership';
import { isCommunityMode, syncTabBarVisibility } from '../../utils/appMode';
import VipName from '../../components/VipName.vue';
import ReviewTabBar from '../../components/ReviewTabBar.vue';

export default {
	components: { ReviewTabBar, VipName },
	data() {
		return {
			reviewMode: true,
			user: {
				nickname: DEFAULT_PROFILE_NAME,
				avatarUrl: '',
				stampNo: '',
				gender: '',
				birthDate: '',
				age: 0,
				city: '',
				intro: '',
				charmValue: 0
			},
			stats: {
				total: 0,
				publicCount: 0,
				privateCount: 0,
				followingCount: 0,
				followerCount: 0
			},
			sealedCapsules: [],
			nearestSeal: null,
			isEditingName: false,
			editNickname: '',
			isSaving: false,
			isUploading: false,
			pendingProfileAudit: null,
			diamondBalance: 0,
			membership: { isMember: false, expiresAt: '' },
			profileTopPadding: 96
		};
	},
	computed: {
		avatarText() {
			const name = this.user.nickname || DEFAULT_PROFILE_NAME || '想';
			return name.slice(0, 1).toUpperCase();
		},
		ageText() {
			if (this.user.age) {
				return `${this.user.gender === '男' ? '♂' : '♀'} ${this.user.age}`;
			}

			return this.user.gender || '♀ 22';
		}
	},
	onLoad() {
		this.syncModePresentation();
		this.setProfileTopPadding();
	},
	onShow() {
		this.syncModePresentation();
		this.loadData();
	},
	onPullDownRefresh() {
		this.loadData().finally(() => {
			uni.stopPullDownRefresh();
		});
	},
	methods: {
		syncModePresentation() {
			this.reviewMode = isCommunityMode();
			syncTabBarVisibility();
		},
		setProfileTopPadding() {
			try {
				const systemInfo = uni.getSystemInfoSync();
				const rpxToPx = (systemInfo.windowWidth || 375) / 750;
				const cardGapPx = Math.round(8 * rpxToPx);

				if (uni.getMenuButtonBoundingClientRect) {
					const menuButton = uni.getMenuButtonBoundingClientRect();
					if (menuButton && menuButton.bottom) {
						this.profileTopPadding = Math.ceil(menuButton.bottom + cardGapPx);
						return;
					}
				}

				const statusBarHeight = systemInfo.statusBarHeight || 44;
				const fallbackNavPx = Math.round(40 * rpxToPx);
				this.profileTopPadding = statusBarHeight + fallbackNavPx + cardGapPx;
			} catch (error) {
				this.profileTopPadding = 104;
			}
		},
		async loadData() {
			try {
				const requests = [fetchCurrentUser(), fetchMyThoughts()];
				if (!this.reviewMode) requests.push(fetchDiamonds(), fetchMembership());
				const [user, list, diamonds = { balance: 0 }, membership = { isMember: false, expiresAt: '' }] = await Promise.all(requests);
				this.user = this.normalizeProfileUser(user);
				refreshCachedUser(user);
				this.pendingProfileAudit = user.pendingProfileAudit || null;
				this.diamondBalance = Number(diamonds.balance || 0);
				this.membership = membership || { isMember: false, expiresAt: '' };
				const items = Array.isArray(list) ? list : [];
				const profileStats = user.stats || {};
				this.stats = {
					total: items.length,
					publicCount: items.filter((item) => item.visibility !== 'private').length,
					privateCount: items.filter((item) => item.visibility === 'private').length,
					followingCount: this.pickMetric(user, profileStats, ['followingCount', 'following_count', 'followCount', 'follow_count']),
					followerCount: this.pickMetric(user, profileStats, ['followerCount', 'follower_count', 'followersCount', 'followers_count', 'fansCount', 'fans_count'])
				};
				const now = new Date();
				const sealed = items
					.filter((item) => item.open_at && new Date(item.open_at) > now)
					.sort((a, b) => new Date(a.open_at) - new Date(b.open_at));
				this.sealedCapsules = sealed;
				this.nearestSeal = sealed[0] || null;
			} catch (error) {
				showRequestError(error, '加载个人信息失败');
			}
		},
		switchToRecords() {
			this.goMyRecords();
		},
		goMyRecords() {
			uni.navigateTo({
				url: '/pages/myRecords/index'
			});
		},
		goFollow(tab) {
			uni.navigateTo({ url: `/pages/follow/index?tab=${tab}` });
		},
		goCharm() {
			uni.navigateTo({ url: '/pages/charm/index' });
		},
		goFavorites() {
			uni.navigateTo({
				url: '/pages/favorites/index'
			});
		},
		goTasks() {
			uni.navigateTo({
				url: '/pages/tasks/index'
			});
		},
		goGiftGallery() {
			uni.navigateTo({ url: '/pages/giftGallery/index' });
		},
		goDiamonds() {
			uni.navigateTo({ url: '/pages/diamonds/index' });
		},
		goMembership() {
			uni.navigateTo({ url: '/pages/membership/index' });
		},
		formatMembershipDate(value) {
			if (!value) return '';
			const date = new Date(value);
			return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
		},
		goProfileComplete() {
			uni.navigateTo({
				url: '/pages/profileComplete/index'
			});
		},
		goAbout() {
			uni.navigateTo({
				url: '/pages/about/index'
			});
		},
		formatSealDate(dateStr) {
			if (!dateStr) return '';
			const d = new Date(dateStr);
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			return `${d.getFullYear()}.${mm}.${dd}`;
		},
		daysUntil(dateStr) {
			if (!dateStr) return 0;
			const diff = new Date(dateStr) - new Date();
			return Math.ceil(diff / (1000 * 60 * 60 * 24));
		},
		pickMetric(profile = {}, profileStats = {}, keys = []) {
			for (const key of keys) {
				if (profile[key] !== undefined && profile[key] !== null) {
					return this.normalizeMetric(profile[key]);
				}
				if (profileStats[key] !== undefined && profileStats[key] !== null) {
					return this.normalizeMetric(profileStats[key]);
				}
			}

			return 0;
		},
		normalizeMetric(value) {
			const count = Number(value || 0);
			return Number.isFinite(count) && count > 0 ? count : 0;
		},
		showComingSoon(name) {
			uni.showToast({
				title: `${name}暂未开发`,
				icon: 'none'
			});
		},
		chooseAvatar() {
			if (this.user.avatarAuditStatus === 'pending') {
				uni.showToast({ title: '头像安全检测中', icon: 'none' });
				return;
			}
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const filePath = res.tempFilePaths[0];
					try {
						this.isUploading = true;
						uni.showLoading({ title: '上传中…', mask: true });
						let uploadPath = filePath;
						try {
							const compressed = await uni.compressImage({ src: filePath, quality: 82 });
							uploadPath = compressed.tempFilePath;
						} catch (error) {}
						const uploaded = await uploadImage(uploadPath);
						const avatarUrl = uploaded.thumbnailUrl || uploaded.url;
						const result = await updateProfile({ avatarUrl });
						this.applyProfileUpdateResult(result, {
							avatarUrl,
							avatar_url: avatarUrl
						});
					} catch (error) {
						showRequestError(error, '头像更新失败');
					} finally {
						this.isUploading = false;
						uni.hideLoading();
					}
				}
			});
		},
		startEditName() {
			this.editNickname = this.user.nickname || '';
			this.isEditingName = true;
		},
		cancelEdit() {
			this.isEditingName = false;
			this.editNickname = '';
		},
		async saveNickname() {
			const nickname = this.editNickname.trim();
			if (!nickname) {
				uni.showToast({ title: '昵称不能为空', icon: 'none' });
				return;
			}
			try {
				this.isSaving = true;
				const result = await updateProfile({ nickname });
				this.applyProfileUpdateResult(result, { nickname });
				this.cancelEdit();
			} catch (error) {
				showRequestError(error, '昵称更新失败');
			} finally {
				this.isSaving = false;
			}
		},
		applyProfileUpdateResult(result, optimisticUpdates) {
			const audit = result && result.audit ? result.audit : null;
			const profile = result && result.user ? result.user : null;

			let pendingAvatar = false;
			if (profile) {
				this.user = this.normalizeProfileUser(profile);
				refreshCachedUser(profile);
				if (profile.avatarAuditStatus === 'pending') {
					pendingAvatar = true;
					uni.showToast({ title: '头像已提交安全检测', icon: 'none' });
				}
			} else if (result && result.id) {
				this.user = this.normalizeProfileUser(result);
				refreshCachedUser(result);
			}

			this.pendingProfileAudit = audit;

			const updateApproved = !pendingAvatar && (
				(result && result.auditStatus === 'approved') ||
				(profile && !audit && !(result && result.auditStatus))
			);
			if (updateApproved) {
				this.pendingProfileAudit = null;
				refreshCachedUser(optimisticUpdates);
				uni.showToast({ title: '资料已更新', icon: 'success' });
				return;
			}

			if (pendingAvatar) return;

			uni.showToast({
				title: audit && audit.status === 'pending' ? '已提交安全审核' : '已提交后台审核',
				icon: 'none'
			});
		},
		normalizeProfileUser(profile = {}) {
			return {
				nickname: profile.nickname || DEFAULT_PROFILE_NAME,
				avatarUrl: profile.avatarUrl || profile.avatar_url || '',
				avatarAuditStatus: profile.avatarAuditStatus || 'approved',
				pendingAvatarUrl: profile.pendingAvatarUrl || '',
				stampNo: profile.stampNo || profile.stamp_no || this.user.stampNo || '',
				gender: profile.gender || '',
				birthDate: profile.birthDate || profile.birth_date || '',
				age: Number(profile.age || 0),
				city: profile.city || '',
				intro: profile.intro || '',
				charmValue: Number(profile.charmValue || 0)
			};
		}
	}
};
</script>

<style lang="scss" scoped>
:global(page) {
	height: 100vh;
	overflow: hidden;
}

.profile-page {
	background: linear-gradient(to bottom, #fff2f7 0%, #fffafd 30%, #f8f7fa 54%, #f8f7fa 100%);
}

.profile-body {
	display: flex;
	flex-direction: column;
	gap: 22rpx;
	padding: 0 24rpx 54rpx;
}

.profile-card {
	position: relative;
	overflow: hidden;
	padding: 28rpx 30rpx 0;
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.62);
	border: 1px solid rgba(244, 214, 226, 0.78);
	box-shadow:
		0 8rpx 32rpx rgba(126, 75, 98, 0.07),
		0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.card-grid {
	position: absolute;
	inset: 0;
	pointer-events: none;
	background-image: radial-gradient(circle, rgba(212, 104, 138, 0.055) 1rpx, transparent 1rpx);
	background-size: 28rpx 28rpx;
}

.card-orb {
	position: absolute;
	border-radius: 50%;
	pointer-events: none;
}

.card-orb-1 {
	width: 340rpx;
	height: 340rpx;
	top: -60rpx;
	right: -80rpx;
	background: radial-gradient(circle, rgba(212, 104, 138, 0.12) 0%, transparent 65%);
}

.card-orb-2 {
	width: 220rpx;
	height: 220rpx;
	bottom: 20rpx;
	left: -60rpx;
	background: radial-gradient(circle, rgba(239, 159, 192, 0.12) 0%, transparent 65%);
}

.profile-main {
	position: relative;
	display: flex;
	align-items: center;
	gap: 26rpx;
	padding-bottom: 28rpx;
	min-width: 0;
}

.avatar-wrap {
	position: relative;
	flex-shrink: 0;
	width: 122rpx;
	height: 122rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-ring {
	position: absolute;
	border-radius: 50%;
	pointer-events: none;
}

.avatar-ring-2 {
	width: 144rpx;
	height: 144rpx;
	border: 1.5px dashed rgba(212, 104, 138, 0.28);
}

.avatar-ring-1 {
	width: 132rpx;
	height: 132rpx;
	background: radial-gradient(circle, rgba(255, 199, 219, 0.45), rgba(212, 104, 138, 0.16) 55%, transparent);
	filter: blur(7rpx);
}

.profile-avatar {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 122rpx;
	height: 122rpx;
	flex-shrink: 0;
	overflow: hidden;
	border-radius: 50%;
	background: linear-gradient(135deg, #fdd35a 0%, #ffb34d 52%, #f08a7c 100%);
	color: #ffffff;
	font-size: 42rpx;
	font-weight: 800;
	z-index: 1;
}

.profile-avatar-fallback {
	box-shadow: inset -22rpx -10rpx 0 rgba(119, 99, 222, 0.2);
}

.profile-copy {
	flex: 1;
	min-width: 0;
}

.profile-name {
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 34rpx;
	line-height: 1.22;
	font-weight: 700;
	color: #2b2028;
	letter-spacing: 0;
}

.profile-id {
	display: block;
	margin-top: 14rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 24rpx;
	line-height: 1.2;
	color: rgba(212, 104, 138, 0.72);
	letter-spacing: 0;
}

.profile-meta-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10rpx;
	margin-top: 12rpx;
	min-height: 34rpx;
}

.profile-gender-pill {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	height: 34rpx;
	padding: 0 12rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	font-weight: 800;
	line-height: 34rpx;
}

.profile-gender-pill.female {
	background: #fff0f6;
	color: #d4688a;
}

.profile-gender-pill.male {
	background: #eef4ff;
	color: #668fe8;
}

.profile-gender-icon {
	width: 20rpx;
	height: 20rpx;
	flex-shrink: 0;
}

.profile-city {
	height: 34rpx;
	padding: 0 12rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.72);
	color: #8f8390;
	font-size: 20rpx;
	font-weight: 700;
	line-height: 34rpx;
}

.profile-intro {
	display: block;
	margin-top: 12rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #766b76;
	font-size: 23rpx;
	line-height: 1.35;
}

.card-rule {
	display: flex;
	align-items: center;
}

.rule-dot {
	width: 8rpx;
	height: 8rpx;
	border-radius: 50%;
	flex-shrink: 0;
	background: rgba(212, 104, 138, 0.26);
}

.rule-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(90deg, rgba(212, 104, 138, 0.12), rgba(239, 159, 192, 0.28), rgba(212, 104, 138, 0.12));
}

.profile-stats {
	display: flex;
	align-items: center;
	padding: 26rpx 0;
}

.profile-stat {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	min-width: 0;
}

.stat-value {
	display: block;
	font-size: 44rpx;
	line-height: 1;
	font-weight: 700;
	letter-spacing: 0;
	color: #d4688a;
	background: linear-gradient(135deg, #d4688a 0%, #ef9fc0 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.stat-label {
	display: block;
	font-size: 20rpx;
	line-height: 1.2;
	color: rgba(142, 116, 132, 0.62);
}

.stat-sep {
	width: 1px;
	height: 40rpx;
	background: linear-gradient(180deg, rgba(212, 104, 138, 0.08), rgba(239, 159, 192, 0.24), rgba(212, 104, 138, 0.08));
}

.menu-card {
	overflow: hidden;
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 8rpx 24rpx rgba(31, 31, 38, 0.035);
	padding: 8rpx 0;
}

.menu-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	min-height: 96rpx;
	padding: 0 34rpx;
	font-size: 30rpx;
	font-weight: 400;
	color: #15151d;
}

.menu-row + .menu-row {
	border-top: 1px solid #f2f2f5;
}

.customer-row {
	width: 100%;
	margin: 0;
	border: 0;
	border-radius: 0;
	background: transparent;
	line-height: normal;
	box-sizing: border-box;
}

.customer-row::after {
	border: 0;
}

.menu-row-left {
	display: flex;
	align-items: center;
	gap: 14rpx;
}

.menu-arrow {
	font-size: 40rpx;
	line-height: 1;
	color: #b8b8bf;
}

.profile-footer {
	position: fixed;
	bottom: calc(20rpx + env(safe-area-inset-bottom));
	left: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
	pointer-events: none;
}

.profile-footer-quote {
	display: block;
	font-size: 26rpx;
	color: rgba(142, 116, 132, 0.58);
	letter-spacing: 0;
	text-align: center;
}

.profile-footer-sub {
	display: block;
	font-size: 22rpx;
	color: rgba(142, 116, 132, 0.38);
	letter-spacing: 0;
	text-align: center;
}

.avatar-edit-badge {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #d4688a, #ef9fc0);
	border: 3rpx solid #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
}

.avatar-edit-icon {
	font-size: 20rpx;
	color: #fff;
	line-height: 1;
}

.name-edit-hint {
	display: block;
	margin-top: 10rpx;
	font-size: 20rpx;
	color: rgba(212, 104, 138, 0.5);
	letter-spacing: 0;
}

.profile-audit-hint {
	display: inline-flex;
	margin-top: 10rpx;
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(255, 176, 62, 0.14);
	color: rgba(160, 96, 12, 0.86);
	font-size: 20rpx;
	line-height: 1.2;
}

.name-popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(55, 34, 46, 0.32);
	display: flex;
	align-items: flex-end;
	z-index: 1000;
}

.name-popup {
	width: 100%;
	background: #fff;
	border-radius: 40rpx 40rpx 0 0;
	padding: 48rpx 40rpx;
	padding-bottom: calc(env(safe-area-inset-bottom) + 48rpx);
	box-sizing: border-box;
}

.popup-title {
	display: block;
	font-size: 32rpx;
	font-weight: 700;
	color: #2b2028;
	text-align: center;
	margin-bottom: 36rpx;
}

.popup-input {
	display: block;
	width: 100%;
	height: 92rpx;
	padding: 0 28rpx;
	border-radius: 20rpx;
	background: #fff7fb;
	font-size: 30rpx;
	color: #2b2028;
	box-sizing: border-box;
	margin-bottom: 36rpx;
	border: 1.5px solid rgba(212, 104, 138, 0.22);
}

.popup-placeholder {
	color: rgba(150, 126, 140, 0.55);
}

.popup-actions {
	display: flex;
	gap: 20rpx;
}

.popup-btn {
	flex: 1;
	height: 92rpx;
	border-radius: 46rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	font-weight: 600;
}

.popup-cancel {
	background: #fff1f7;
	color: #9d7181;
}

.popup-save {
	background: linear-gradient(135deg, #d4688a, #ef9fc0);
	color: #fff;
}

.profile-page {
	height: 100vh;
	min-height: 100vh;
	padding-bottom: 0;
	overflow: hidden;
	background: linear-gradient(180deg, #fbf7ff 0%, #f8f8fb 44%, #ffffff 100%);
}

.profile-body {
	position: relative;
	height: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	gap: 18rpx;
	padding: 0 28rpx calc(124rpx + env(safe-area-inset-bottom));
}

.profile-body::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 330rpx;
	pointer-events: none;
	background-image:
		linear-gradient(135deg, rgba(236, 229, 255, 0.9) 0%, rgba(255, 247, 252, 0.84) 46%, rgba(232, 250, 244, 0.78) 100%),
		linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 96%);
	border-bottom-left-radius: 46rpx;
	border-bottom-right-radius: 46rpx;
}

.profile-card,
.quick-card,
.member-card,
.menu-card {
	z-index: 1;
}

.profile-card {
	position: relative;
	overflow: visible;
	min-height: auto;
	padding: 0;
	border: 0;
	border-radius: 0;
	background: transparent;
	box-shadow: none;
}

.card-grid,
.card-orb,
.card-rule,
.avatar-ring,
.profile-id,
.profile-meta-row,
.name-edit-hint,
.profile-footer {
	display: none;
}

.profile-main {
	position: relative;
	z-index: 2;
	align-items: flex-start;
	gap: 26rpx;
	padding: 12rpx 8rpx 22rpx;
}

.profile-main::after {
	display: none;
}

.avatar-wrap {
	width: 136rpx;
	height: 136rpx;
}

.profile-avatar {
	width: 136rpx;
	height: 136rpx;
	border: 5rpx solid rgba(255, 255, 255, 0.96);
	background: #eef1f0;
	box-shadow: 0 10rpx 24rpx rgba(50, 48, 68, 0.11);
}

.avatar-edit-badge {
	right: 0;
	bottom: 2rpx;
	width: 34rpx;
	height: 34rpx;
	border: 3rpx solid #ffffff;
	background: linear-gradient(135deg, #8f7bff, #aa8dff);
}

.avatar-edit-icon {
	font-size: 18rpx;
}

.profile-copy {
	position: relative;
	z-index: 2;
	padding-top: 4rpx;
}

.name-row,
.intro-row,
.tag-row,
.menu-row-right,
.member-left,
.member-btn {
	display: flex;
	align-items: center;
}

.name-row {
	gap: 14rpx;
	min-width: 0;
}

.profile-name {
	max-width: 330rpx;
	font-size: 36rpx;
	line-height: 1.22;
	font-weight: 900;
	color: #1f2028;
	letter-spacing: 0;
}

.age-pill {
	display: flex;
	align-items: center;
	height: 34rpx;
	padding: 0 12rpx;
	border-radius: 999rpx;
	background: #ffe5ed;
	color: #ff7898;
	font-size: 20rpx;
	font-weight: 800;
}

.intro-row {
	gap: 12rpx;
	margin-top: 12rpx;
	min-width: 0;
}

.profile-intro {
	display: block;
	max-width: 400rpx;
	margin: 0;
	font-size: 25rpx;
	line-height: 1.35;
	color: #7b7488;
}

.edit-mini {
	font-size: 20rpx;
	color: #5f6270;
	line-height: 1;
}

.tag-row {
	gap: 10rpx;
	flex-wrap: wrap;
	margin-top: 13rpx;
}

.tag-chip,
.tag-add {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 34rpx;
	padding: 0 14rpx;
	border-radius: 999rpx;
	font-size: 21rpx;
	font-weight: 800;
	line-height: 34rpx;
}

.tag-purple { background: #eee8ff; color: #9373eb; }
.tag-blue { background: #e9f2ff; color: #6294e8; }
.tag-yellow { background: #fff1c7; color: #df9a18; }
.tag-mint { background: #e8f8ef; color: #49b57d; }

.tag-add {
	width: 48rpx;
	padding: 0;
	background: #ffffff;
	color: #22242d;
	box-shadow: 0 5rpx 15rpx rgba(58, 56, 74, 0.08);
}

.profile-audit-hint {
	display: none;
}

.profile-stats {
	position: relative;
	z-index: 3;
	margin: 0;
	padding: 22rpx 0;
	border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 8rpx 22rpx rgba(49, 45, 68, 0.055);
}

.profile-stat {
	position: relative;
	gap: 10rpx;
}

.stat-clickable:active {
	opacity: 0.62;
}

.stat-value {
	font-size: 32rpx;
	font-weight: 900;
	letter-spacing: 0;
	color: #1f2028;
	background: none;
	-webkit-text-fill-color: #1f2028;
}

.stat-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	font-size: 24rpx;
	font-weight: 900;
	line-height: 1;
}

.charm-stat-icon {
	background: linear-gradient(135deg, rgba(212, 104, 138, 0.16), rgba(239, 159, 192, 0.2));
	color: #d4688a;
}

.stat-label {
	font-size: 23rpx;
	color: #8a8795;
}

.stat-sep {
	position: static;
	flex-shrink: 0;
	width: 1px;
	height: 42rpx;
	background: #ececf2;
}

.stat-badge {
	position: absolute;
	top: -14rpx;
	right: 38rpx;
	min-width: 28rpx;
	height: 28rpx;
	padding: 0 5rpx;
	border-radius: 999rpx;
	background: #ff6f83;
	color: #ffffff;
	font-size: 18rpx;
	font-weight: 900;
	line-height: 28rpx;
}

.quick-card,
.member-card,
.menu-card {
	position: relative;
	border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 8rpx 22rpx rgba(49, 45, 68, 0.045);
}

.quick-card {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	padding: 26rpx 16rpx 24rpx;
}

.review-profile-stats {
	justify-content: center;
}

.review-profile-stats .profile-stat {
	max-width: 240rpx;
}

.review-quick-card {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quick-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 0;
}

.quick-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
	border-radius: 15rpx;
	color: #ffffff;
	font-size: 26rpx;
	font-weight: 900;
	box-shadow: 0 12rpx 22rpx rgba(60, 54, 80, 0.12);
}

.heart-icon { background: linear-gradient(135deg, #ff9b89, #ff6f78); }
.chat-icon { background: linear-gradient(135deg, #75b8ff, #668cff); font-size: 22rpx; }
.star-icon { background: linear-gradient(135deg, #ffd65e, #f6b62c); }
.user-icon { background: linear-gradient(135deg, #72ddb0, #41c77d); font-size: 28rpx; }

.quick-title {
	margin-top: 14rpx;
	font-size: 25rpx;
	
	color: #252733;
	line-height: 1.2;
}

.quick-sub {
	margin-top: 6rpx;
	font-size: 21rpx;
	color: #a5a2af;
	line-height: 1.2;
}

.member-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18rpx;
	min-height: 112rpx;
	padding: 18rpx 28rpx;
	border-radius: 22rpx;
	background: linear-gradient(110deg, #20212d, #2b2c39 70%, #1f2434);
	box-shadow: 0 18rpx 32rpx rgba(32, 33, 45, 0.16);
}

.member-left {
	gap: 18rpx;
	min-width: 0;
}

.crown-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: #ffe4c6;
	color: #292433;
	font-size: 30rpx;
}

.member-copy {
	min-width: 0;
}

.member-title,
.member-sub {
	display: block;
	line-height: 1.25;
}

.member-title {
	font-size: 28rpx;
	font-weight: 900;
	color: #ffe6ca;
}

.member-sub {
	margin-top: 6rpx;
	font-size: 22rpx;
	color: rgba(255, 233, 209, 0.66);
}

.member-btn {
	flex-shrink: 0;
	gap: 6rpx;
	height: 54rpx;
	padding: 0 20rpx;
	border-radius: 999rpx;
	background: #ffe8c9;
	color: #3a3032;
	font-size: 26rpx;
	font-weight: 900;
}

.member-arrow {
	font-size: 30rpx;
	line-height: 1;
}

.menu-card {
	display: flex;
	flex-direction: column;
	min-height: 0;
	border-radius: 22rpx;
	padding: 12rpx 0;
	box-shadow: 0 14rpx 32rpx rgba(49, 45, 68, 0.055);
}

.menu-row {
	flex: none;
	width: 100%;
	height: 96rpx;
	min-height: 96rpx;
	margin: 0;
	padding: 0 32rpx;
	border: 0;
	border-radius: 0;
	background: transparent;
	font-size: 29rpx;
	font-weight: 400;
	color: #282a35;
	line-height: normal;
	box-sizing: border-box;
}

.menu-row + .menu-row {
	border-top: 1rpx solid #f3f1f4;
}

.menu-row-left {
	gap: 24rpx;
}

.menu-row-emoji {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44rpx;
	height: 44rpx;
	font-size: 30rpx;
	line-height: 1;
}

.menu-row-right {
	gap: 14rpx;
}

.menu-note {
	font-size: 23rpx;
	font-weight: 400;
	color: #a5a3ad;
}

.diamond-mini-icon {
	width: 30rpx;
	height: 30rpx;
	flex-shrink: 0;
}

.menu-arrow {
	font-size: 32rpx;
	font-weight: 500;
	color: #c5c2cc;
}

@media (max-width: 360px) {
	.profile-body {
		padding-left: 22rpx;
		padding-right: 22rpx;
		gap: 14rpx;
	}

	.profile-card {
		padding: 0;
	}

	.profile-avatar {
		width: 124rpx;
		height: 124rpx;
	}

	.avatar-wrap {
		width: 124rpx;
		height: 124rpx;
	}

	.profile-name {
		font-size: 34rpx;
	}

	.profile-id,
	.stat-label {
		font-size: 22rpx;
	}

	.menu-row {
		height: 88rpx;
		min-height: 88rpx;
		font-size: 26rpx;
	}

	.menu-card {
		min-height: 0;
	}

	.member-card {
		min-height: 100rpx;
		padding: 16rpx 24rpx;
	}

	.member-title {
		font-size: 26rpx;
	}

	.member-sub {
		font-size: 20rpx;
	}
}
</style>
