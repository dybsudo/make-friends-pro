<template>
	<view class="top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
		<view class="back-button" hover-class="back-button--pressed" @click.stop="goBack">
			<text class="back-icon">‹</text>
		</view>
	</view>

	<scroll-view id="landing-scroll" class="landing" scroll-y enhanced :show-scrollbar="false" @scroll="onScroll">
		<template v-if="reviewMode">
			<view class="hero review-hero">
				<image class="hero-img" src="/static/beijing.png" mode="aspectFill" />
				<view class="hero-mask" />
				<view class="hero-content">
					<text class="hero-eyebrow">COMMUNITY</text>
					<view class="logo-wrap">
						<image class="logo-img" src="/static/logo.png" mode="aspectFit" />
					</view>
					<text class="hero-tagline">记录生活，分享此刻</text>
				</view>
			</view>
			<view class="section section-light rv-visible">
				<view class="section-visual world-panel">
					<text class="s-body world-lead">想法记录是一个分享日常内容的社区。</text>
					<view class="world-card">
						<text class="world-title">分享生活中的片刻</text>
						<text class="world-body">你可以发布文字和图片，浏览社区动态，并通过评论、点赞和收藏参与公开交流。</text>
						<text class="world-body">请遵守社区规范，共同维护真实、友善、有价值的内容环境。</text>
					</view>
				</view>
			</view>
			<view class="footer">
				<view class="footer-rule" />
				<text class="footer-txt">记录日常，也尊重每一份表达</text>
			</view>
		</template>
		<template v-else>

		<!-- ① Hero：背景图 + 遮罩 + 品牌文案 -->
		<view class="hero">
			<image class="hero-img" src="/static/beijing.png" mode="aspectFill" />
			<view class="hero-mask" />
			<text class="sparkle sp-1">✦</text>
			<text class="sparkle sp-2">✧</text>
			<text class="sparkle sp-3">✦</text>
			<text class="sparkle sp-4">✧</text>
			<view class="hero-content">
				<text class="hero-eyebrow">FANTASY REALM</text>
				<view class="logo-wrap">
					<image class="logo-img" src="/static/logo.png" mode="aspectFit" />
					<view class="logo-shimmer" />
				</view>
				<view class="hero-rule">
					<view class="rule-line" /><text class="rule-dot">◆</text><view class="rule-line" />
				</view>
				<text class="hero-tagline">那些没说出口的小纸条，在这里有一席之地</text>
			</view>
			<view class="hero-hint">
				<text class="hint-txt">向下了解更多</text>
				<text class="hint-arrow">↓</text>
			</view>
		</view>

		<!-- ② 这是什么 -->
		<view id="rv-s1" :class="['section section-light', rv.s1 ? 'rv-visible' : 'rv-hidden']">

			<view class="section-visual world-panel">
				<view class="tech-grid" />
				<view class="tech-corner corner-tl" />
				<view class="tech-corner corner-br" />
				<text class="s-body world-lead">
					这里存放的，不只是秘密，而是一张张现实暂时接不住的小纸条。
				</text>
				<view class="world-card">
					<view class="world-title-row">
						<view class="world-title-mark" />
						<text class="world-title">这里允许你把没说出口的心事，轻轻折起来</text>
					</view>
					<text class="world-body">
						每个人都有一些不方便当面说的话。它们可能很轻，也可能很重；可能只是一瞬间的念头，却真实地来过。
					</text>
					<text class="world-body">
						你可以把它写成一张小纸条，带着自己的温度放下，让这份真实记录留住当下。
					</text>
				</view>
			</view>
		</view>

		<!-- ③ 可以放进来什么 -->
		<view id="rv-s2" :class="['section section-tinted', rv.s2 ? 'rv-visible' : 'rv-hidden']">
			<view class="list-panel">
				<view class="list-head">
					<text class="s-eyebrow list-eyebrow">可以写下什么</text>
					<view class="list-head-line" />
				</view>
				<view class="item-list">
					<view class="item-row">
						<text class="item-mark">◆</text>
						<text class="item-txt">不方便在现实中说出口的一句话</text>
					</view>
					<view class="item-row">
						<text class="item-mark">◆</text>
						<text class="item-txt">突然冒出来、又不知道该发给谁的念头</text>
					</view>
					<view class="item-row">
						<text class="item-mark">◆</text>
						<text class="item-txt">带着羞耻感、别扭感、失控感的小心事</text>
					</view>
					<view class="item-row">
						<text class="item-mark">◆</text>
						<text class="item-txt">想暂时放下，但又不想彻底删掉的片刻</text>
					</view>
					<view class="item-row">
						<text class="item-mark">◆</text>
						<text class="item-txt">希望被理解，也愿意被温柔看见的表达</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ④ 共鸣 -->
		<view id="rv-s3" :class="['section section-quote', rv.s3 ? 'rv-visible' : 'rv-hidden']">
			<text class="quote-mark">“</text>
			<text class="quote-txt">一张认真写下的小纸条，也可能被认真读懂</text>
			<text class="quote-sub">认真记录日常，也珍惜每一次成长</text>
		</view>

		<!-- 今日话题·科技卡 -->
		<view v-if="todayTopics.length" class="sci-section">
			<view class="sci-section-head">
				<view class="sci-sh-line" />
				<text class="sci-sh-title">今日话题</text>
				<view class="sci-sh-line" />
			</view>
			<view class="sci-topic">
				<view class="sci-corner sci-tl" />
				<view class="sci-corner sci-tr" />
				<view class="sci-corner sci-bl" />
				<view class="sci-corner sci-br" />
				<view class="sci-grid" />
				<view class="sci-scan" />
				<view class="sci-particle sci-p1" />
				<view class="sci-particle sci-p2" />
				<view class="sci-particle sci-p3" />
				<view class="sci-label-row">
					<view class="sci-pulse-dot" />
					<text class="sci-label">TODAY · TOPIC</text>
					<view class="sci-label-line" />
					<text class="sci-date">{{ formatTopicDate() }}</text>
				</view>
				<text class="sci-hash"># {{ todayTopics[0].title }}</text>
				<text v-if="todayTopics[0].description" class="sci-desc">{{ todayTopics[0].description }}</text>
				<view v-if="todayTopics[0].tags && todayTopics[0].tags.length" class="sci-tags">
					<text v-for="tag in todayTopics[0].tags.slice(0, 3)" :key="tag" class="sci-tag">{{ tag }}</text>
				</view>
				<text class="sci-sys-id">FANTASY_REALM · SYS_NOTE · WRITE_NOW</text>
			</view>
		</view>

		<!-- 底部边界声明 -->
		<view class="footer">
			<view class="footer-rule" />
			<text class="footer-txt">你可以在这里放下复杂心事，但不能把真实伤害带进来</text>
		</view>
		</template>

	</scroll-view>
</template>

<script>
import { fetchTodayTopics } from '../../api/thought';
import { COMMUNITY_SLOGO, SHARE_IMAGE_URL, SLOGO } from '../../config';
import { isCommunityMode } from '../../utils/appMode';

export default {
	data() {
		return {
			reviewMode: true,
			statusBarHeight: 0,
			shareImageUrl: SHARE_IMAGE_URL,
			slogo: SLOGO,
			todayTopics: [],
			rv: { s1: false, s2: false, s3: false },
			wh: 0
		};
	},
	onLoad() {
		this.reviewMode = isCommunityMode();
		this.slogo = this.reviewMode ? COMMUNITY_SLOGO : SLOGO;
		const systemInfo = uni.getSystemInfoSync();
		this.statusBarHeight = systemInfo.statusBarHeight || 0;
	},
	onShow() {
		this.reviewMode = isCommunityMode();
		this.slogo = this.reviewMode ? COMMUNITY_SLOGO : SLOGO;
		if (!this.reviewMode) this.loadTodayTopics();
	},
	onReady() {
		this.wh = uni.getSystemInfoSync().windowHeight;
	},
	onShareAppMessage() {
		return {
			title: this.slogo,
			path: '/pages/about/index',
			imageUrl: this.shareImageUrl
		};
	},
	methods: {
		onScroll() {
			const { s1, s2, s3 } = this.rv;
			if (s1 && s2 && s3) return;
			const wh = this.wh || uni.getSystemInfoSync().windowHeight;
			const keys = ['s1', 's2', 's3'];
			const query = uni.createSelectorQuery().in(this);
			keys.forEach(key => query.select('#rv-' + key).boundingClientRect());
			query.exec(rects => {
				keys.forEach((key, i) => {
					if (rects[i] && rects[i].top < wh * 0.9) {
						this.rv[key] = true;
					}
				});
			});
		},
		async loadTodayTopics() {
			try {
				const result = await fetchTodayTopics();
				this.todayTopics = Array.isArray(result) ? result : [];
			} catch (e) {
				this.todayTopics = [];
			}
		},
		goBack() {
			uni.navigateBack({
				fail: () => uni.switchTab({ url: '/pages/profile/index' })
			});
		},
		formatTopicDate() {
			const d = new Date();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			return `${d.getFullYear()}.${mm}.${dd}`;
		}
	}
};
</script>

<style lang="scss" scoped>
/* ─────────────── Keyframes ─────────────── */
@keyframes fadeInUp {
	from { opacity: 0; transform: translateY(24rpx); }
	to   { opacity: 1; transform: translateY(0); }
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50%       { transform: translateY(-14rpx); }
}

@keyframes shimmer {
	0%   { transform: translateX(-160%) skewX(-18deg); }
	100% { transform: translateX(420%) skewX(-18deg); }
}

@keyframes twinkle {
	0%, 100% { opacity: 0.08; transform: scale(0.6); }
	50%       { opacity: 0.9; transform: scale(1.3); }
}

@keyframes hintBounce {
	0%, 100% { transform: translateY(0); }
	50%       { transform: translateY(8rpx); }
}

/* ─────────────── 全局 ─────────────── */
.landing {
	height: 100vh;
	background: #faf8ff;
}

.top-nav {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 88rpx;
	z-index: 20;
	box-sizing: content-box;
	pointer-events: none;
}

.back-button {
	width: 68rpx;
	height: 68rpx;
	margin: 10rpx 0 0 24rpx;
	border: 1rpx solid rgba(120, 60, 180, 0.14);
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.76);
	box-shadow: 0 8rpx 24rpx rgba(82, 42, 120, 0.12);
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(12rpx);
	pointer-events: auto;
}

.back-button--pressed {
	opacity: 0.72;
	transform: scale(0.96);
}

.back-icon {
	font-size: 58rpx;
	font-family: Arial, sans-serif;
	font-weight: 300;
	line-height: 1;
	color: rgba(61, 24, 96, 0.78);
	transform: translate(-2rpx, -2rpx);
}

/* ─────────────── Hero ─────────────── */
.hero {
	position: relative;
	height: 100vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.hero-img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	opacity: 0.18;
}

.hero-mask {
	position: absolute;
	inset: 0;
	background: linear-gradient(170deg, rgba(232, 224, 255, 0.6) 0%, rgba(245, 223, 248, 0.55) 50%, rgba(252, 232, 242, 0.7) 100%);
}

.hero-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 48rpx;
	margin-top: -60rpx;
}

.hero-eyebrow {
	display: block;
	font-size: 20rpx;
	letter-spacing: 8rpx;
	color: rgba(100, 50, 160, 0.55);
	margin-bottom: 20rpx;
	animation: fadeInUp 0.8s 0.2s ease both;
}

.logo-wrap {
	position: relative;
	width: 500rpx;
	height: 170rpx;
	overflow: hidden;
	animation: fadeInUp 0.9s 0.5s ease both, float 5s 2s ease-in-out infinite;
}

.logo-img {
	width: 100%;
	height: 100%;
}

.logo-shimmer {
	position: absolute;
	top: 0;
	left: 0;
	width: 80rpx;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
	animation: shimmer 3.5s 2.5s ease-in-out infinite;
}

.hero-rule {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin: 28rpx 0 26rpx;
	width: 260rpx;
	animation: fadeInUp 0.8s 0.9s ease both;
}

.rule-line {
	flex: 1;
	height: 1rpx;
	background: rgba(120, 60, 180, 0.3);
}

.rule-dot {
	font-size: 14rpx;
	color: rgba(140, 70, 190, 0.5);
}

.hero-tagline {
	display: block;
	font-size: 28rpx;
	color: rgba(60, 20, 90, 0.65);
	letter-spacing: 3rpx;
	text-align: center;
	line-height: 1.7;
	margin-bottom: 0;
	animation: fadeInUp 0.8s 1.1s ease both;
}

.hero-hint {
	position: absolute;
	bottom: 48rpx;
	left: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
	z-index: 1;
}

.hint-txt {
	font-size: 20rpx;
	color: rgba(100, 50, 160, 0.4);
	letter-spacing: 2rpx;
}

.hint-arrow {
	font-size: 24rpx;
	color: rgba(100, 50, 160, 0.35);
	animation: hintBounce 1.8s ease-in-out infinite;
}

/* Sparkles */
.sparkle {
	position: absolute;
	z-index: 1;
	pointer-events: none;
	color: rgba(140, 80, 220, 0.75);
	animation: twinkle ease-in-out infinite;
}

.sp-1 { font-size: 30rpx; top: 14%; left: 10%; animation-duration: 2.8s; animation-delay: 0.3s; }
.sp-2 { font-size: 20rpx; top: 20%; right: 12%; animation-duration: 3.6s; animation-delay: 1s; }
.sp-3 { font-size: 16rpx; top: 62%; right: 8%;  animation-duration: 2.3s; animation-delay: 1.6s; }
.sp-4 { font-size: 26rpx; bottom: 20%; left: 14%; animation-duration: 4s;   animation-delay: 0.8s; }

/* Scroll Reveal */
.rv-hidden {
	opacity: 0;
	transform: translateY(52rpx) scale(0.97);
}

.rv-visible {
	opacity: 1;
	transform: translateY(0) scale(1);
	transition: opacity 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94),
	            transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* ─────────────── Sections ─────────────── */
.section {
	padding: 64rpx 32rpx;
}

.section-light {
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(250, 248, 255, 0.98)),
		#ffffff;
}

.section-tinted {
	background:
		linear-gradient(180deg, rgba(244, 239, 255, 0.9), rgba(255, 250, 253, 0.96)),
		#f4efff;
}

.s-eyebrow {
	display: block;
	font-size: 20rpx;
	letter-spacing: 6rpx;
	color: rgba(120, 60, 180, 0.55);
	margin-bottom: 24rpx;
}

.s-heading {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #2d1248;
	letter-spacing: 2rpx;
	margin-bottom: 32rpx;
	line-height: 1.4;
}

.s-body {
	display: block;
	font-size: 28rpx;
	color: #3d1860;
	line-height: 1.9;
	opacity: 0.7;
	margin-bottom: 16rpx;
	letter-spacing: 1rpx;
}

.section-visual {
	position: relative;
	overflow: hidden;
	border: 1rpx solid rgba(139, 105, 205, 0.16);
	background: rgba(255, 255, 255, 0.78);
	box-shadow: 0 26rpx 70rpx rgba(112, 70, 160, 0.09);
}

.tech-grid {
	position: absolute;
	inset: 0;
	opacity: 0.46;
	background-image:
		linear-gradient(rgba(143, 112, 210, 0.1) 1rpx, transparent 1rpx),
		linear-gradient(90deg, rgba(143, 112, 210, 0.1) 1rpx, transparent 1rpx);
	background-size: 36rpx 36rpx;
	pointer-events: none;
}

.tech-corner {
	position: absolute;
	width: 58rpx;
	height: 58rpx;
	border-color: rgba(212, 104, 138, 0.5);
	border-style: solid;
	pointer-events: none;
}

.corner-tl {
	top: 18rpx;
	left: 18rpx;
	border-width: 2rpx 0 0 2rpx;
}

.corner-br {
	right: 18rpx;
	bottom: 18rpx;
	border-width: 0 2rpx 2rpx 0;
}

.world-panel {
	padding: 28rpx 22rpx 24rpx;
	border-radius: 24rpx;
}

.world-lead {
	position: relative;
	z-index: 1;
	margin-bottom: 22rpx;
	padding: 6rpx 6rpx 8rpx 22rpx;
	border-left: 4rpx solid rgba(212, 104, 138, 0.58);
	color: rgba(45, 18, 72, 0.78);
}

.world-card {
	position: relative;
	z-index: 1;
	padding: 26rpx 22rpx;
	border-radius: 18rpx;
	background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(247, 242, 255, 0.86));
	border: 1rpx solid rgba(120, 60, 180, 0.13);
	box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.9), 0 18rpx 44rpx rgba(120, 60, 180, 0.08);
}

.world-title-row {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
	margin-bottom: 18rpx;
}

.world-title-mark {
	width: 18rpx;
	height: 18rpx;
	margin-top: 13rpx;
	border-radius: 4rpx;
	background: linear-gradient(135deg, #d4688a, #8f70d2);
	box-shadow: 0 0 18rpx rgba(143, 112, 210, 0.32);
	flex-shrink: 0;
}

.world-title {
	display: block;
	flex: 1;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 1.6;
	color: #2d1248;
}

.world-body {
	display: block;
	font-size: 25rpx;
	line-height: 1.85;
	color: rgba(61, 24, 96, 0.68);
	letter-spacing: 1rpx;
}

.world-body + .world-body {
	margin-top: 12rpx;
}

/* Item list */
.list-panel {
	position: relative;
	overflow: hidden;
	padding: 34rpx 26rpx 30rpx;
	border-radius: 22rpx;
	background:
		linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(250, 247, 255, 0.82)),
		linear-gradient(90deg, rgba(212, 104, 138, 0.1), rgba(143, 112, 210, 0.1));
	border: 1rpx solid rgba(143, 112, 210, 0.14);
	box-shadow: 0 24rpx 58rpx rgba(112, 70, 160, 0.08);
}

.list-panel::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 4rpx;
	background: linear-gradient(90deg, #d4688a, rgba(143, 112, 210, 0.55), transparent);
}

.list-panel::after {
	content: "";
	position: absolute;
	right: 24rpx;
	top: 28rpx;
	width: 116rpx;
	height: 116rpx;
	border: 1rpx solid rgba(143, 112, 210, 0.13);
	border-radius: 50%;
	opacity: 0.7;
}

.list-head {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	gap: 18rpx;
	margin-bottom: 26rpx;
}

.list-eyebrow {
	margin-bottom: 0;
	color: rgba(45, 18, 72, 0.78);
	font-weight: 700;
	letter-spacing: 4rpx;
}

.list-head-line {
	flex: 1;
	height: 1rpx;
	background: linear-gradient(90deg, rgba(212, 104, 138, 0.32), rgba(143, 112, 210, 0.08));
}

.item-list {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	gap: 0;
	border-top: 1rpx solid rgba(120, 60, 180, 0.08);
}

.item-row {
	position: relative;
	display: flex;
	align-items: center;
	gap: 20rpx;
	min-height: 78rpx;
	padding: 20rpx 4rpx;
	border-bottom: 1rpx solid rgba(120, 60, 180, 0.08);
}

.item-mark {
	width: 30rpx;
	height: 30rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.92);
	border: 1rpx solid rgba(212, 104, 138, 0.28);
	box-shadow: 0 0 0 6rpx rgba(212, 104, 138, 0.06);
	font-size: 12rpx;
	line-height: 30rpx;
	text-align: center;
	color: #d4688a;
	flex-shrink: 0;
}

.item-txt {
	font-size: 27rpx;
	color: #2d1248;
	line-height: 1.7;
	letter-spacing: 1rpx;
	opacity: 0.82;
	flex: 1;
}

/* Quote */
.section-quote {
	background: #ede8ff;
	padding: 80rpx 48rpx;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.quote-mark {
	display: block;
	font-size: 90rpx;
	color: rgba(120, 60, 180, 0.15);
	line-height: 0.8;
	margin-bottom: 16rpx;
}

.quote-txt {
	display: block;
	font-size: 34rpx;
	font-weight: 600;
	color: #2d1248;
	letter-spacing: 2rpx;
	line-height: 1.8;
	margin-bottom: 24rpx;
}

.quote-sub {
	display: block;
	font-size: 24rpx;
	color: rgba(100, 50, 160, 0.5);
	letter-spacing: 2rpx;
}

/* ─────────────── Footer ─────────────── */
.footer {
	padding: 32rpx 48rpx 64rpx;
	background: #ffffff;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.footer-rule {
	width: 80rpx;
	height: 1rpx;
	background: rgba(120, 60, 180, 0.2);
}

.footer-txt {
	font-size: 22rpx;
	color: #3d1860;
	opacity: 0.4;
	letter-spacing: 1rpx;
	text-align: center;
	line-height: 1.7;
}

/* ─────────────── 今日话题·科技卡（浅色系） ─────────────── */
@keyframes topBarShift {
	0%, 100% { background-position: 0% 50%; }
	50%       { background-position: 100% 50%; }
}

@keyframes shimmerSweep {
	0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
	8%   { opacity: 1; }
	92%  { opacity: 1; }
	100% { transform: translateX(520%) skewX(-18deg); opacity: 0; }
}

@keyframes sciPulse {
	0%, 100% { transform: scale(1); opacity: 1; }
	50%       { transform: scale(0.7); opacity: 0.4; }
}

@keyframes scanLine {
	0%   { top: -4rpx; opacity: 0; }
	5%   { opacity: 0.5; }
	95%  { opacity: 0.3; }
	100% { top: 100%; opacity: 0; }
}

@keyframes cardFloat {
	0%, 100% { transform: rotate(3deg) translateY(0rpx); }
	50%       { transform: rotate(3deg) translateY(-12rpx); }
}

@keyframes particleFloat1 {
	0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
	33%       { transform: translateY(-18rpx) translateX(8rpx); opacity: 0.9; }
	66%       { transform: translateY(-8rpx) translateX(-6rpx); opacity: 0.6; }
}

@keyframes particleFloat2 {
	0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
	40%       { transform: translateY(-22rpx) translateX(-10rpx); opacity: 0.8; }
	70%       { transform: translateY(-6rpx) translateX(12rpx); opacity: 0.5; }
}

@keyframes particleFloat3 {
	0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; }
	50%       { transform: translateY(-14rpx) scale(1.4); opacity: 0.75; }
}

/* 标题区 */
.sci-section {
	padding: 0 24rpx 56rpx;
}

.sci-section-head {
	display: flex;
	align-items: center;
	gap: 18rpx;
	margin-bottom: 24rpx;
	padding: 70rpx 8rpx 50rpx;
}

.sci-sh-line {
	flex: 1;
	height: 1rpx;
	background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), transparent);
}

.sci-sh-title {
	font-size: 26rpx;
	font-weight: 700;
	color: #2d1248;
	letter-spacing: 6rpx;
	opacity: 0.6;
}

/* 卡片主体 */
.sci-topic {
	position: relative;
	border-radius: 28rpx;
	background: linear-gradient(150deg, #ffffff 0%, #fdf6ff 55%, #fff4f8 100%);
	border: 1.5rpx solid rgba(180, 100, 255, 0.18);
	box-shadow:
		4rpx 16rpx 50rpx rgba(168, 85, 247, 0.14),
		0 4rpx 12rpx rgba(212, 104, 138, 0.1),
		inset 0 1rpx 0 rgba(255, 255, 255, 1);
	overflow: hidden;
	padding: 42rpx 36rpx 36rpx;
	animation: cardFloat 5s ease-in-out infinite;
}

/* 顶部彩色条 */
.sci-topic::before {

}

/* 斜扫光 */
.sci-topic::after {
	content: '';
	position: absolute;
	top: 0; bottom: 0; left: 0;
	width: 80rpx;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
	animation: shimmerSweep 6s ease-in-out infinite;
	pointer-events: none;
}

/* 四角 */
.sci-corner {
	position: absolute;
	width: 36rpx;
	height: 36rpx;
	border-color: rgba(212, 104, 138, 0.45);
	border-style: solid;
	pointer-events: none;
}

.sci-tl { top: 18rpx; left: 18rpx; border-width: 2rpx 0 0 2rpx; }
.sci-tr { top: 18rpx; right: 18rpx; border-width: 2rpx 2rpx 0 0; }
.sci-bl { bottom: 18rpx; left: 18rpx; border-width: 0 0 2rpx 2rpx; }
.sci-br { bottom: 18rpx; right: 18rpx; border-width: 0 2rpx 2rpx 0; }

/* 网格底纹 */
.sci-grid {
	position: absolute;
	inset: 0;
	opacity: 0.04;
	background-image:
		linear-gradient(rgba(155, 89, 245, 1) 1rpx, transparent 1rpx),
		linear-gradient(90deg, rgba(155, 89, 245, 1) 1rpx, transparent 1rpx);
	background-size: 48rpx 48rpx;
	pointer-events: none;
}

/* 扫描线 */
.sci-scan {
	position: absolute;
	left: 0; right: 0;
	height: 2rpx;
	background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.45) 40%, rgba(212, 104, 138, 0.45) 60%, transparent);
	animation: scanLine 7s linear infinite;
	pointer-events: none;
	z-index: 1;
}

/* 漂浮粒子 */
.sci-particle {
	position: absolute;
	border-radius: 50%;
	pointer-events: none;
	z-index: 1;
}

.sci-p1 {
	width: 10rpx; height: 10rpx;
	background: rgba(212, 104, 138, 0.55);
	top: 28%; right: 12%;
	box-shadow: 0 0 10rpx rgba(212, 104, 138, 0.5);
	animation: particleFloat1 3.8s ease-in-out infinite;
}

.sci-p2 {
	width: 7rpx; height: 7rpx;
	background: rgba(168, 85, 247, 0.55);
	top: 55%; right: 20%;
	box-shadow: 0 0 8rpx rgba(168, 85, 247, 0.5);
	animation: particleFloat2 4.5s ease-in-out infinite 0.8s;
}

.sci-p3 {
	width: 12rpx; height: 12rpx;
	background: rgba(96, 165, 250, 0.45);
	bottom: 28%; right: 8%;
	box-shadow: 0 0 12rpx rgba(96, 165, 250, 0.4);
	animation: particleFloat3 5.2s ease-in-out infinite 1.6s;
}

/* 标签行 */
.sci-label-row {
	display: flex;
	align-items: center;
	gap: 14rpx;
	margin-bottom: 24rpx;
	position: relative;
	z-index: 2;
}

.sci-pulse-dot {
	width: 12rpx; height: 12rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #d4688a, #a855f7);
	flex-shrink: 0;
	box-shadow: 0 0 8rpx rgba(212, 104, 138, 0.6);
	animation: sciPulse 2.2s ease-in-out infinite;
}

.sci-label {
	font-size: 19rpx;
	color: #a855f7;
	letter-spacing: 5rpx;
	font-weight: 700;
	flex-shrink: 0;
}

.sci-label-line {
	flex: 1;
	height: 1rpx;
	background: linear-gradient(90deg, rgba(168, 85, 247, 0.35), transparent);
}

.sci-date {
	font-size: 19rpx;
	color: rgba(168, 85, 247, 0.45);
	letter-spacing: 2rpx;
	flex-shrink: 0;
}

/* 话题标题 */
.sci-hash {
	display: block;
	font-size: 40rpx;
	font-weight: 800;
	color: #2d1248;
	line-height: 1.4;
	letter-spacing: 1rpx;
	margin-bottom: 16rpx;
	position: relative;
	z-index: 2;
}

/* 描述 */
.sci-desc {
	display: block;
	font-size: 25rpx;
	color: rgba(61, 24, 96, 0.55);
	line-height: 1.75;
	letter-spacing: 1rpx;
	margin-bottom: 22rpx;
	position: relative;
	z-index: 2;
}

/* 话题标签 */
.sci-tags {
	display: flex;
	gap: 12rpx;
	margin-bottom: 30rpx;
	flex-wrap: wrap;
	position: relative;
	z-index: 2;
}

.sci-tag {
	padding: 6rpx 20rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(212, 104, 138, 0.08), rgba(168, 85, 247, 0.08));
	border: 1rpx solid rgba(168, 85, 247, 0.22);
	font-size: 20rpx;
	color: #9b59f5;
	letter-spacing: 1rpx;
}

/* 系统 ID 行 */
.sci-sys-id {
	display: block;
	font-size: 18rpx;
	color: rgba(168, 85, 247, 0.3);
	letter-spacing: 3rpx;
	text-align: right;
	position: relative;
	z-index: 2;
}
</style>
