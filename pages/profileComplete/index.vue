<template>
	<view class="complete-page">
		<view class="top-wash"></view>

		<scroll-view class="content-scroll" scroll-y enhanced :show-scrollbar="false">
			<view class="hero-block">
				<view class="hero-copy">
					<text class="title">完善资料</text>
					<text class="desc">完善头像和昵称，记录属于你的生活</text>
				</view>
				<view v-if="!reviewMode" class="hero-illus">
					<view class="illus-board">
						<view class="illus-clip"></view>
						<view class="illus-avatar"></view>
						<view class="illus-line long"></view>
						<view class="illus-line short"></view>
					</view>
					<view class="heart-bubble">♥</view>
				</view>
			</view>

			<view class="profile-card">
				<view class="card-head">
					<view class="card-title-wrap">
						<text class="card-title">基础信息</text>
						<text class="required-tip">* 为必填项</text>
					</view>
					<view v-if="!reviewMode" class="match-tip">资料越完整，分享内容越有辨识度</view>
				</view>

				<view class="info-list">
					<view class="info-row avatar-row" @click="chooseAvatar">
						<view class="row-icon avatar-icon">
							<view class="icon-user"></view>
						</view>
						<view class="row-main">
							<view class="row-title">
								<text>头像</text>
								<text class="required">*</text>
							</view>
							<text class="row-desc">{{ avatarStatusText }}</text>
						</view>
						<view class="avatar-shell">
							<image class="avatar" :src="form.avatarUrl || defaultAvatar" mode="aspectFill" />
							<view class="camera-dot"></view>
						</view>
						<text class="arrow">›</text>
					</view>

					<view class="info-row">
						<view class="row-icon nickname-icon">
							<view class="icon-smile"></view>
						</view>
						<view class="row-main">
							<view class="row-title">
								<text>昵称</text>
								<text class="required">*</text>
							</view>
							<text class="row-desc">2-16 个字</text>
						</view>
						<input v-model="form.nickname" class="row-input" maxlength="16" placeholder="怎么称呼你" placeholder-class="placeholder" />
					</view>

					<view v-if="!reviewMode" class="info-row">
						<view class="row-icon gender-icon-wrap">
							<view class="icon-heart"></view>
						</view>
						<view class="row-main">
							<view class="row-title">
								<text>性别</text>
								<text class="required">*</text>
							</view>
							<text v-if="profileIdentityLocked" class="row-desc">保存后不允许修改</text>
						</view>
						<view class="gender-switch" :class="{ locked: profileIdentityLocked }">
							<view
								v-for="item in genderOptions"
								:key="item"
								class="gender-item"
								:class="{ active: form.gender === item, disabled: profileIdentityLocked }"
								@click="selectGender(item)"
							>
								<image class="gender-mini-icon" :src="item === '男' ? '/static/img/nan-icon.png' : '/static/img/nv-icon.png'" mode="aspectFit" />
								<text>{{ item }}</text>
							</view>
						</view>
					</view>

					<picker
						v-if="!reviewMode"
						mode="date"
						:value="form.birthDate"
						:start="minBirthDate"
						:end="maxBirthDate"
						:disabled="profileIdentityLocked"
						@change="onBirthDateChange"
					>
						<view class="info-row" :class="{ locked: profileIdentityLocked }">
							<view class="row-icon birth-icon">
								<view class="icon-cake"></view>
							</view>
							<view class="row-main">
								<view class="row-title">
									<text>出生年月日</text>
									<text class="required">*</text>
								</view>
								<text v-if="profileIdentityLocked" class="row-desc">保存后不允许修改</text>
							</view>
							<text class="row-value" :class="{ empty: !form.birthDate }">{{ form.birthDate || '请选择' }}</text>
							<text v-if="!profileIdentityLocked" class="arrow">›</text>
							<text v-else class="lock-mark">锁定</text>
						</view>
					</picker>

					<view v-if="!reviewMode" class="info-row">
						<view class="row-icon city-icon">
							<view class="icon-pin"></view>
						</view>
						<view class="row-main">
							<view class="row-title">
								<text>所在城市</text>
								<text class="required">*</text>
							</view>
						</view>
						<input v-model="form.city" class="row-input" maxlength="30" placeholder="填写城市" placeholder-class="placeholder" />
					</view>

					<view v-if="!reviewMode" class="info-row intro-row">
						<view class="row-icon intro-icon">
							<view class="icon-pen"></view>
						</view>
						<view class="row-main intro-main">
							<view class="row-title">
								<text>介绍</text>
							</view>
							<textarea
								v-model="form.intro"
								class="intro-input"
								maxlength="80"
								placeholder="写一点关于你的关键词"
								placeholder-class="placeholder"
								auto-height
							/>
						</view>
						<text class="intro-count">{{ form.intro.length }}/80</text>
					</view>
				</view>
			</view>

			<view class="page-bottom"></view>
		</scroll-view>

		<view class="footer">
			<view class="save-btn" :class="{ disabled: !canSubmit }" @click="submitProfile">
				<text>{{ avatarAuditStatus === 'pending' ? '头像检测中...' : (saving ? '保存中...' : '保存并继续') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { fetchCurrentUser, updateProfile } from '../../api/user';
import { DEFAULT_AVATAR_URL, DEFAULT_PROFILE_NAME } from '../../config';
import { isCommunityMode } from '../../utils/appMode';
import { refreshCachedUser } from '../../utils/auth';
import { showRequestError } from '../../utils/feedback';
import { uploadImage } from '../../utils/request';
import * as profileGuard from '../../utils/profileGuard';

export default {
	data() {
		return {
			reviewMode: true,
			defaultAvatar: DEFAULT_AVATAR_URL,
			redirect: '',
			uploading: false,
			saving: false,
			profileIdentityLocked: false,
			avatarAuditStatus: 'approved',
			avatarCheckTimer: null,
			genderOptions: ['女', '男'],
			form: {
				avatarUrl: '',
				nickname: '',
				gender: '',
				birthDate: '',
				city: '',
				intro: ''
			}
		};
	},
	computed: {
		avatarStatusText() {
			if (this.uploading) return '头像上传中...';
			if (this.avatarAuditStatus === 'pending') return '微信安全检测中...';
			if (this.avatarAuditStatus === 'blocked') return '未通过安全检测，请重新选择';
			return '展示一下自己吧';
		},
		maxBirthDate() {
			const date = new Date();
			date.setFullYear(date.getFullYear() - 16);
			return this.formatDateValue(date);
		},
		minBirthDate() {
			const date = new Date();
			date.setFullYear(date.getFullYear() - 99);
			return this.formatDateValue(date);
		},
		canSubmit() {
			if (this.avatarAuditStatus === 'pending') return false;
			if (this.reviewMode) {
				return Boolean(
					!this.uploading &&
					!this.saving &&
					this.form.avatarUrl &&
					this.form.nickname.trim()
				);
			}
			return Boolean(
				!this.uploading &&
					!this.saving &&
					this.form.avatarUrl &&
					this.form.nickname.trim() &&
					this.form.gender &&
					this.form.birthDate &&
					this.form.city.trim()
			);
		}
	},
	onLoad(query = {}) {
		this.reviewMode = isCommunityMode();
		this.redirect = query.redirect ? decodeURIComponent(query.redirect) : '';
		this.loadProfile();
	},
	onShow() {
		if (this.avatarAuditStatus === 'pending') this.scheduleAvatarStatusCheck();
	},
	onHide() {
		this.clearAvatarStatusCheck();
	},
	onUnload() {
		this.clearAvatarStatusCheck();
	},
	methods: {
		clearAvatarStatusCheck() {
			if (!this.avatarCheckTimer) return;
			clearTimeout(this.avatarCheckTimer);
			this.avatarCheckTimer = null;
		},
		scheduleAvatarStatusCheck() {
			this.clearAvatarStatusCheck();
			if (this.avatarAuditStatus !== 'pending') return;
			this.avatarCheckTimer = setTimeout(async () => {
				this.avatarCheckTimer = null;
				try {
					const user = await fetchCurrentUser();
					this.applyUser(user);
					refreshCachedUser({
						...user,
						profileCompleted: profileGuard.isProfileCompleted(user)
					});
					if (this.avatarAuditStatus === 'approved' && profileGuard.isProfileCompleted(user)) {
						uni.showToast({ title: '头像安全检测通过', icon: 'success', duration: 800 });
						setTimeout(this.goNext, 800);
						return;
					}
				} catch (error) {}
				this.scheduleAvatarStatusCheck();
			}, 4000);
		},
		applyUser(user = {}) {
			const pending = user.pendingProfileAudit || user.audit || null;
			this.profileIdentityLocked = Boolean(user.userId || user.publicUserId);
			this.avatarAuditStatus = user.avatarAuditStatus || (pending && pending.status) || 'approved';
			this.form = {
				avatarUrl: user.pendingAvatarUrl || (pending && pending.avatarUrl) || user.avatarUrl || '',
				nickname: (pending && pending.nickname) || user.nickname || DEFAULT_PROFILE_NAME,
				gender: user.gender || '',
				birthDate: user.birthDate || '',
				city: user.city || '',
				intro: user.intro || ''
			};
			if (this.avatarAuditStatus === 'blocked') {
				uni.showToast({ title: '头像未通过安全检测，请重新选择', icon: 'none' });
			}
		},
		selectGender(value) {
			if (this.profileIdentityLocked) {
				uni.showToast({ title: '性别不允许修改', icon: 'none' });
				return;
			}
			this.form.gender = value;
		},
		async loadProfile() {
			try {
				const user = await fetchCurrentUser();
				this.applyUser(user);
				refreshCachedUser({
					...user,
					profileCompleted: profileGuard.isProfileCompleted(user)
				});
				if (this.avatarAuditStatus === 'pending') this.scheduleAvatarStatusCheck();
			} catch (error) {}
		},
		async chooseAvatar() {
			if (this.uploading || this.avatarAuditStatus === 'pending') {
				if (this.avatarAuditStatus === 'pending') {
					uni.showToast({ title: '头像安全检测中', icon: 'none' });
				}
				return;
			}
			try {
				const result = await uni.chooseImage({
					count: 1,
					sizeType: ['compressed', 'original'],
					sourceType: ['album', 'camera']
				});
				const filePath = (result.tempFilePaths || [])[0];
				if (!filePath) return;

				this.uploading = true;
				let uploadPath = filePath;
				try {
					const compressed = await uni.compressImage({ src: filePath, quality: 82 });
					uploadPath = compressed.tempFilePath;
				} catch (error) {}

				const uploaded = await uploadImage(uploadPath);
				if (uploaded && uploaded.url) {
					this.form.avatarUrl = uploaded.thumbnailUrl || uploaded.url;
				}
			} catch (error) {
				if (error && error.errMsg && error.errMsg.includes('cancel')) return;
				showRequestError(error, '头像上传失败');
			} finally {
				this.uploading = false;
			}
		},
		formatDateValue(date) {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		},
		getAgeFromBirthDate(value) {
			if (!value) return 0;
			const parts = value.split('-').map(Number);
			if (parts.length !== 3 || parts.some((item) => !item)) return 0;
			const [year, month, day] = parts;
			const today = new Date();
			let age = today.getFullYear() - year;
			const passed = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
			if (!passed) age -= 1;
			return age;
		},
		onBirthDateChange(event) {
			if (this.profileIdentityLocked) {
				uni.showToast({ title: '出生日期不允许修改', icon: 'none' });
				return;
			}
			this.form.birthDate = event.detail.value || '';
		},
		validateForm() {
			if (!this.form.avatarUrl) return '请先上传头像';
			if (!this.form.nickname.trim()) return '请填写昵称';
			if (this.reviewMode) return '';
			if (!this.form.gender) return '请选择性别';
			const age = this.getAgeFromBirthDate(this.form.birthDate);
			if (!age || age < 16 || age > 99) return '请选择正确的出生日期';
			if (!this.form.city.trim()) return '请填写城市';
			if (this.form.intro.trim().length > 80) return '介绍不能超过 80 个字';
			return '';
		},
		buildCacheUser(response = {}, payload = {}) {
			const user = response.user || response || {};
			const audit = response.audit || user.audit || null;
			const avatarPending = user.avatarAuditStatus === 'pending';
			const merged = {
				...user,
				...payload,
				nickname: (audit && audit.nickname) || payload.nickname || user.nickname,
				avatarUrl: avatarPending
					? (user.avatarUrl || '')
					: ((audit && audit.avatarUrl) || payload.avatarUrl || user.avatarUrl),
				pendingAvatarUrl: avatarPending ? (user.pendingAvatarUrl || payload.avatarUrl || '') : ''
			};
			return {
				...merged,
				profileCompleted: profileGuard.isProfileCompleted(merged)
			};
		},
		goNext() {
			const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
			if (pages.length > 1) {
				uni.navigateBack();
				return;
			}
			if (this.redirect && this.redirect.startsWith('/pages/')) {
				uni.navigateTo({
					url: this.redirect,
					fail: () => uni.switchTab({ url: '/pages/square/index' })
				});
				return;
			}
			uni.switchTab({ url: '/pages/square/index' });
		},
		async submitProfile() {
			if (this.saving) return;
			const message = this.validateForm();
			if (message) {
				uni.showToast({ title: message, icon: 'none' });
				return;
			}

			const payload = {
				avatarUrl: this.form.avatarUrl,
				nickname: this.form.nickname.trim()
			};
			if (!this.reviewMode) {
				payload.city = this.form.city.trim();
				payload.intro = this.form.intro.trim();
			}
			if (!this.reviewMode && !this.profileIdentityLocked) {
				payload.gender = this.form.gender;
				payload.birthDate = this.form.birthDate;
				payload.age = this.getAgeFromBirthDate(this.form.birthDate);
			}

			this.saving = true;
			try {
				const response = await updateProfile(payload);
				const cachedUser = this.buildCacheUser(response, payload);
				refreshCachedUser(cachedUser);
				if (cachedUser.avatarAuditStatus === 'pending') {
					this.avatarAuditStatus = 'pending';
					this.scheduleAvatarStatusCheck();
					uni.showModal({
						title: '头像安全检测中',
						content: '昵称和个人介绍已保存，头像通过微信安全检测后即可继续使用。',
						showCancel: false
					});
					return;
				}
				uni.showToast({ title: '资料已补充', icon: 'success', duration: 800 });
				setTimeout(this.goNext, 800);
			} catch (error) {
				showRequestError(error, '资料保存失败');
			} finally {
				this.saving = false;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.complete-page {
	position: relative;
	min-height: 100vh;
	background:
		linear-gradient(180deg, #fff7fb 0%, #ffffff 36%, #fffafd 100%);
	box-sizing: border-box;
	overflow: hidden;
}

.top-wash {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	height: 390rpx;
	background:
		radial-gradient(circle at 78% 8%, rgba(212, 104, 138, 0.12), transparent 190rpx),
		linear-gradient(135deg, #f7fbff 0%, #fff2f8 54%, rgba(255, 255, 255, 0) 100%);
	pointer-events: none;
}

.content-scroll {
	position: relative;
	z-index: 1;
	height: 100vh;
	box-sizing: border-box;
}

.hero-block {
	position: relative;
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding: 70rpx 34rpx 34rpx;
	box-sizing: border-box;
}

.hero-copy {
	position: relative;
	z-index: 2;
	flex: 1;
	min-width: 0;
	padding-top: 8rpx;
}

.title,
.desc,
.card-title,
.required-tip,
.row-title,
.row-desc {
	display: block;
}

.title {
	color: #241b22;
	font-size: 52rpx;
	font-weight: 900;
	line-height: 1.05;
}

.title::after {
	content: '';
	display: block;
	width: 152rpx;
	height: 12rpx;
	margin-top: -4rpx;
	border-radius: 999rpx;
	background: linear-gradient(90deg, rgba(212, 104, 138, 0.36), rgba(212, 104, 138, 0));
}

.desc {
	margin-top: 20rpx;
	color: #928691;
	font-size: 25rpx;
	line-height: 1.5;
}

.hero-illus {
	position: relative;
	width: 178rpx;
	height: 178rpx;
	flex-shrink: 0;
}

.illus-board {
	position: absolute;
	top: 10rpx;
	right: 0;
	width: 142rpx;
	height: 150rpx;
	border-radius: 28rpx;
	background: linear-gradient(160deg, #fff8fc 0%, #f1edff 100%);
	box-shadow: 0 18rpx 34rpx rgba(168, 139, 210, 0.18);
	transform: rotate(10deg);
}

.illus-clip {
	position: absolute;
	top: -14rpx;
	left: 46rpx;
	width: 54rpx;
	height: 28rpx;
	border-radius: 14rpx 14rpx 8rpx 8rpx;
	background: linear-gradient(135deg, #d4688a, #ef9fc0);
}

.illus-avatar {
	position: absolute;
	top: 44rpx;
	left: 24rpx;
	width: 46rpx;
	height: 46rpx;
	border-radius: 50%;
	background: rgba(212, 104, 138, 0.16);
}

.illus-line {
	position: absolute;
	left: 78rpx;
	height: 10rpx;
	border-radius: 999rpx;
	background: rgba(166, 151, 178, 0.22);
}

.illus-line.long {
	top: 52rpx;
	width: 42rpx;
}

.illus-line.short {
	top: 76rpx;
	width: 28rpx;
}

.heart-bubble {
	position: absolute;
	left: 2rpx;
	top: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: #fff4f9;
	color: #d4688a;
	font-size: 28rpx;
	font-weight: 900;
	box-shadow: 0 12rpx 26rpx rgba(212, 104, 138, 0.12);
}

.profile-card {
	position: relative;
	margin: 0 22rpx;
	padding: 28rpx 22rpx 18rpx;
	border-radius: 30rpx;
	background: rgba(255, 255, 255, 0.98);
	border: 1rpx solid rgba(244, 232, 238, 0.96);
	box-shadow: 0 18rpx 48rpx rgba(105, 76, 92, 0.07);
	box-sizing: border-box;
}

.card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	padding: 0 4rpx 22rpx;
}

.card-title-wrap {
	display: flex;
	align-items: baseline;
	gap: 12rpx;
}

.card-title {
	position: relative;
	padding-left: 18rpx;
	color: #241b22;
	font-size: 30rpx;
	font-weight: 900;
}

.card-title::before {
	content: '';
	position: absolute;
	left: 0;
	top: 7rpx;
	width: 7rpx;
	height: 28rpx;
	border-radius: 999rpx;
	background: #d4688a;
}

.required-tip {
	color: #c79aaa;
	font-size: 20rpx;
}

.match-tip {
	max-width: 260rpx;
	height: 44rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: #fff0f6;
	color: #d4688a;
	font-size: 20rpx;
	line-height: 44rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.info-list {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
}

.info-row {
	display: flex;
	align-items: center;
	gap: 18rpx;
	min-height: 98rpx;
	padding: 20rpx 20rpx;
	border-radius: 22rpx;
	background: #ffffff;
	border: 1rpx solid rgba(244, 232, 238, 0.92);
	box-sizing: border-box;
}

.info-row.locked {
	background: #fbfafb;
}

.row-icon {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.avatar-icon {
	background: #f1efff;
	color: #9787e9;
}

.nickname-icon {
	background: #fff0f6;
	color: #d4688a;
}

.gender-icon-wrap {
	background: #f4efff;
	color: #a087e8;
}

.birth-icon {
	background: #fff5e9;
	color: #e0a04a;
}

.city-icon {
	background: #edf4ff;
	color: #7d99ec;
}

.intro-icon {
	background: #eef7f1;
	color: #78b887;
}

.icon-user,
.icon-smile,
.icon-heart,
.icon-cake,
.icon-pin,
.icon-pen {
	position: relative;
	width: 30rpx;
	height: 30rpx;
	color: currentColor;
	box-sizing: border-box;
}

.icon-user::before {
	content: '';
	position: absolute;
	left: 9rpx;
	top: 3rpx;
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: currentColor;
	opacity: 0.9;
}

.icon-user::after {
	content: '';
	position: absolute;
	left: 5rpx;
	bottom: 3rpx;
	width: 20rpx;
	height: 13rpx;
	border-radius: 14rpx 14rpx 8rpx 8rpx;
	background: currentColor;
	opacity: 0.9;
}

.icon-smile {
	border: 3rpx solid currentColor;
	border-radius: 50%;
}

.icon-smile::before {
	content: '';
	position: absolute;
	left: 8rpx;
	top: 9rpx;
	width: 4rpx;
	height: 4rpx;
	border-radius: 50%;
	background: currentColor;
	box-shadow: 10rpx 0 0 currentColor;
}

.icon-smile::after {
	content: '';
	position: absolute;
	left: 8rpx;
	top: 15rpx;
	width: 12rpx;
	height: 7rpx;
	border-bottom: 3rpx solid currentColor;
	border-radius: 0 0 14rpx 14rpx;
}

.icon-heart {
	width: 28rpx;
	height: 26rpx;
	transform: rotate(-45deg);
}

.icon-heart::before,
.icon-heart::after {
	content: '';
	position: absolute;
	background: currentColor;
}

.icon-heart::before {
	left: 6rpx;
	top: 8rpx;
	width: 17rpx;
	height: 17rpx;
	border-radius: 4rpx 4rpx 2rpx 4rpx;
}

.icon-heart::after {
	left: 6rpx;
	top: 0;
	width: 17rpx;
	height: 17rpx;
	border-radius: 50%;
	box-shadow: 8rpx 8rpx 0 currentColor;
}

.icon-cake {
	width: 30rpx;
	height: 28rpx;
}

.icon-cake::before {
	content: '';
	position: absolute;
	left: 5rpx;
	bottom: 4rpx;
	width: 20rpx;
	height: 14rpx;
	border-radius: 5rpx 5rpx 4rpx 4rpx;
	background: currentColor;
}

.icon-cake::after {
	content: '';
	position: absolute;
	left: 13rpx;
	top: 2rpx;
	width: 4rpx;
	height: 10rpx;
	border-radius: 999rpx;
	background: currentColor;
	box-shadow: -7rpx 10rpx 0 -1rpx #ffffff, 7rpx 10rpx 0 -1rpx #ffffff;
}

.icon-pin {
	border: 3rpx solid currentColor;
	border-radius: 50% 50% 50% 8rpx;
	transform: rotate(-45deg);
}

.icon-pin::before {
	content: '';
	position: absolute;
	left: 8rpx;
	top: 8rpx;
	width: 8rpx;
	height: 8rpx;
	border-radius: 50%;
	background: currentColor;
}

.icon-pen {
	width: 30rpx;
	height: 30rpx;
}

.icon-pen::before {
	content: '';
	position: absolute;
	left: 12rpx;
	top: 2rpx;
	width: 8rpx;
	height: 24rpx;
	border-radius: 999rpx;
	background: currentColor;
	transform: rotate(42deg);
}

.icon-pen::after {
	content: '';
	position: absolute;
	left: 4rpx;
	bottom: 3rpx;
	width: 20rpx;
	height: 3rpx;
	border-radius: 999rpx;
	background: currentColor;
	opacity: 0.35;
}

.row-main {
	flex: 1;
	min-width: 0;
}

.row-title {
	display: flex;
	align-items: center;
	gap: 5rpx;
	color: #2d2630;
	font-size: 26rpx;
	font-weight: 900;
}

.required {
	color: #d4688a;
}

.row-desc {
	margin-top: 8rpx;
	color: #b1a7b0;
	font-size: 21rpx;
	line-height: 1.3;
}

.row-input {
	width: 220rpx;
	height: 58rpx;
	color: #4a4049;
	font-size: 25rpx;
	font-weight: 800;
	text-align: right;
	flex-shrink: 0;
}

.row-value {
	color: #4a4049;
	font-size: 25rpx;
	font-weight: 800;
	flex-shrink: 0;
}

.row-value.empty {
	color: #b9adb7;
	font-weight: 500;
}

.lock-mark {
	height: 34rpx;
	padding: 0 12rpx;
	border-radius: 999rpx;
	background: #f3eef1;
	color: #9a8e97;
	font-size: 20rpx;
	line-height: 34rpx;
	flex-shrink: 0;
}

.placeholder {
	color: #b9adb7;
	font-weight: 400;
}

.arrow {
	color: #c5bbc3;
	font-size: 42rpx;
	line-height: 1;
	flex-shrink: 0;
}

.avatar-row {
	min-height: 118rpx;
}

.avatar-shell {
	position: relative;
	width: 96rpx;
	height: 96rpx;
	flex-shrink: 0;
}

.avatar {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: #f8f1f6;
	box-shadow: 0 8rpx 20rpx rgba(212, 104, 138, 0.12);
}

.camera-dot {
	position: absolute;
	right: -2rpx;
	bottom: 0;
	width: 30rpx;
	height: 30rpx;
	border-radius: 50%;
	background: #d4688a;
	border: 4rpx solid #ffffff;
	box-sizing: border-box;
}

.gender-switch {
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 6rpx;
	border-radius: 999rpx;
	background: #f8f4f8;
	flex-shrink: 0;
}

.gender-switch.locked {
	background: #f1f0f2;
}

.gender-item {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	min-width: 104rpx;
	height: 50rpx;
	border-radius: 999rpx;
	color: #9e94a0;
	font-size: 23rpx;
	font-weight: 800;
}

.gender-item.active {
	background: #ffffff;
	color: #d4688a;
	box-shadow: 0 6rpx 16rpx rgba(212, 104, 138, 0.12);
}

.gender-item.disabled {
	opacity: 0.58;
}

.gender-item.disabled.active {
	color: #8d858d;
	box-shadow: none;
}

.gender-mini-icon {
	width: 24rpx;
	height: 24rpx;
	flex-shrink: 0;
}

.intro-row {
	align-items: flex-start;
	min-height: 136rpx;
}

.intro-main {
	padding-top: 2rpx;
}

.intro-input {
	width: 100%;
	min-height: 58rpx;
	margin-top: 10rpx;
	color: #4a4049;
	font-size: 24rpx;
	line-height: 1.5;
}

.intro-count {
	align-self: flex-end;
	color: #c5bbc3;
	font-size: 20rpx;
	flex-shrink: 0;
}

.page-bottom {
	height: calc(150rpx + env(safe-area-inset-bottom));
}

.footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 5;
	padding: 18rpx 40rpx calc(22rpx + env(safe-area-inset-bottom));
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.98) 36%);
	backdrop-filter: blur(16rpx);
	box-sizing: border-box;
}

.save-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 84rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #d4688a 0%, #ed9cbd 100%);
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 900;
	box-shadow: 0 16rpx 34rpx rgba(212, 104, 138, 0.24);
}

.save-btn.disabled {
	background: #f3c2d4;
	box-shadow: 0 10rpx 22rpx rgba(212, 104, 138, 0.12);
}
</style>
