<template>
	<view class="create-page">

		<!-- 单卡片内容区 -->
		<scroll-view class="body" scroll-y enhanced :show-scrollbar="false">

			<view class="main-card">
				<!-- 正文 -->
				<textarea
					v-model="form.content"
					class="content-area"
					:placeholder="reviewMode ? '分享此刻的想法和生活' : '把它写下来……不必解释，不必合理'"
					placeholder-class="ph"
					maxlength="3000"
					auto-height
				/>
				<text class="char-hint">{{ form.content.length }} / 3000</text>
				<view v-if="topic.id" class="topic-chip">
					<text class="topic-chip-txt"># {{ topic.title }}</text>
				</view>

				<view class="card-sep" />

				<!-- 图片 -->
				<view class="img-row">
					<view
						v-for="(item, index) in form.images"
						:key="index"
						class="img-item"
					>
						<image :src="item.url" mode="aspectFill" class="img-thumb" />
						<view class="img-remove" @click="removeImage(index)">×</view>
					</view>
					<view
						v-if="form.images.length < 9"
						class="img-add"
						@click="chooseImage"
					>
						<text class="img-add-icon">＋</text>
					</view>
				</view>

				<!-- 标签 -->
				<scroll-view class="tag-scroll" scroll-x :show-scrollbar="false">
					<view class="tag-row">
						<view
							v-for="item in tagOptions"
							:key="item"
							class="tag-chip"
							:class="{ 'tag-active': form.tags.includes(item) }"
							@click="toggleTag(item)"
						>
							<text class="tag-hash">#</text>{{ item }}
						</view>
					</view>
				</scroll-view>

			</view>

			<!-- 底部撑高 -->
			<view class="body-foot" />

		</scroll-view>

		<!-- 固定底部：保存按钮 -->
		<view class="fixed-footer">
			<view
				class="submit-btn"
				:class="{ 'is-submitting': submitting }"
				@click="submit"
			>
				<text class="submit-txt">{{ submitting ? '保存中……' : (reviewMode ? '发布动态' : '保存这个想法') }}</text>
			</view>
		</view>

	</view>
</template>

<script>
import { COMMUNITY_TAG_OPTIONS, TAG_OPTIONS } from '../../config';
import { isCommunityMode } from '../../utils/appMode';
import { createLocalPost } from '../../utils/localPosts';

export default {
	data() {
		return {
			reviewMode: true,
			submitting: false,
			uploading: false,
			topic: {
				id: '',
				title: '',
				description: '',
				tags: []
			},
			tagOptions: COMMUNITY_TAG_OPTIONS,
			form: {
				title: '',
				content: '',
				images: [],
				tags: []
			}
		};
	},
	onLoad(query) {
		this.reviewMode = isCommunityMode();
		this.tagOptions = this.reviewMode ? COMMUNITY_TAG_OPTIONS : TAG_OPTIONS;
		if (!this.reviewMode && query && query.topicId) {
			this.topic = {
				id: this.safeDecode(query.topicId || ''),
				title: this.safeDecode(query.topicTitle || ''),
				description: this.safeDecode(query.topicDescription || ''),
				tags: this.parseTopicTags(query.topicTags)
			};
			this.applyTopicTags();
		}
	},
	methods: {
		safeDecode(value) {
			if (!value) return '';
			try {
				return decodeURIComponent(value);
			} catch (error) {
				return String(value);
			}
		},
		parseTopicTags(value) {
			if (!value) return [];
			return this.safeDecode(value)
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);
		},
		applyTopicTags() {
			if (!Array.isArray(this.topic.tags) || !this.topic.tags.length) {
				return;
			}
			this.form.tags = [...new Set([...this.topic.tags, ...this.form.tags])]
				.filter((tag) => this.tagOptions.includes(tag))
				.slice(0, 3);
		},
		toggleTag(tag) {
			const exists = this.form.tags.includes(tag);
			if (exists) {
				this.form.tags = this.form.tags.filter((item) => item !== tag);
				return;
			}
			if (this.form.tags.length >= 3) {
				uni.showToast({ title: '最多选 3 个标签', icon: 'none' });
				return;
			}
			this.form.tags = [...this.form.tags, tag];
		},
		async chooseImage() {
			if (this.uploading) return;
			this.uploading = true;
			try {
				const result = await uni.chooseImage({
					count: 9 - this.form.images.length,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera']
				});
				const files = result.tempFilePaths || [];
				for (const filePath of files) {
					let compressedPath = filePath;
					try {
						const compressed = await uni.compressImage({ src: filePath, quality: 80 });
						compressedPath = compressed.tempFilePath;
					} catch (e) {
						// 压缩失败时使用原图
					}
					this.form.images.push({ url: compressedPath });
				}
			} catch (error) {
				if (error && error.errMsg && error.errMsg.includes('cancel')) return;
				uni.showToast({ title: '图片选择失败', icon: 'none' });
			} finally {
				this.uploading = false;
			}
		},
		removeImage(index) {
			this.form.images.splice(index, 1);
		},
		buildPayload() {
			return {
				title: this.form.title,
				content: this.form.content,
				mediaType: this.form.images.length ? 'image' : 'text',
				visibility: 'public_named',
				topicId: this.topic.id,
				topicTitle: this.topic.title,
				tags: this.form.tags,
				images: this.form.images
			};
		},
		async submit() {
			if (this.submitting || this.uploading) return;
			if (!this.form.content.trim() && !this.form.images.length) {
				uni.showToast({ title: '写点内容或放一张图吧', icon: 'none' });
				return;
			}
			if (!this.form.tags.length) {
				uni.showToast({ title: '至少选 1 个标签', icon: 'none' });
				return;
			}
			this.submitting = true;
			try {
				await createLocalPost(this.buildPayload());
				uni.showToast({ title: '发布成功', icon: 'success', duration: 900 });
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/square/index'
					});
				}, 900);
			} catch (error) {
				uni.showToast({ title: '本地保存失败，请重试', icon: 'none' });
			} finally {
				this.submitting = false;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
/* ── Page ── */
.create-page {
	min-height: 100vh;
	background: #f7f7f7;
	display: flex;
	flex-direction: column;
}

/* ── Scroll body ── */
.body {
	flex: 1;
	padding: 20rpx 24rpx 0;
}

/* ── Single main card ── */
.main-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 32rpx;
	box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.05);
}

.card-sep {
	height: 1rpx;
	background: #f0f0f0;
	margin: 24rpx 0;
}

.topic-chip {
	display: inline-flex;
	align-items: center;
	margin-top: 14rpx;
	padding: 6rpx 20rpx;
	border-radius: 999rpx;
	background: rgba(212, 104, 138, 0.07);
	border: 1rpx solid rgba(212, 104, 138, 0.2);
}

.topic-chip-txt {
	font-size: 22rpx;
	color: #d4688a;
	opacity: 0.75;
	letter-spacing: 1rpx;
}

/* ── Content textarea ── */
.content-area {
	display: block;
	width: 100%;
	min-height: 300rpx;
	font-size: 28rpx;
	color: #333333;
	line-height: 1.85;
	letter-spacing: 0.5rpx;
}

.ph {
	color: #cccccc;
}

.char-hint {
	display: block;
	text-align: right;
	margin-top: 16rpx;
	font-size: 22rpx;
	color: #cccccc;
}

/* ── Image row ── */
.img-row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 16rpx;
}

.img-item {
	position: relative;
	width: 160rpx;
	height: 160rpx;
	border-radius: 12rpx;
	overflow: hidden;
}

.img-thumb {
	width: 100%;
	height: 100%;
}

.img-remove {
	position: absolute;
	top: 6rpx;
	right: 6rpx;
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.45);
	color: #fff;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
}

.img-add {
	width: 160rpx;
	height: 160rpx;
	border-radius: 12rpx;
	border: 1.5rpx dashed #e0e0e0;
	background: #fafafa;
	display: flex;
	align-items: center;
	justify-content: center;
}

.img-add-icon {
	font-size: 52rpx;
	color: #cccccc;
	line-height: 1;
}

/* ── Tags (single-line horizontal scroll, gray) ── */
.tag-scroll {
	width: 100%;
}

.tag-row {
	display: inline-flex;
	flex-direction: row;
	gap: 12rpx;
	width: max-content;
}

.tag-chip {
	display: inline-flex;
	align-items: center;
	height: 52rpx;
	padding: 0 20rpx;
	border-radius: 26rpx;
	background: #f6f6f6;
	font-size: 24rpx;
	color: #888888;
	flex-shrink: 0;
}

.tag-active {
	background: #d4688a;
	color: #ffffff;
}

.tag-hash {
	font-size: 20rpx;
	margin-right: 4rpx;
	opacity: 0.6;
}

/* ── Spacer ── */
.body-foot {
	height: 160rpx;
}

/* ── Fixed footer ── */
.fixed-footer {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 16rpx 32rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	background: rgba(255, 255, 255, 0.96);
	backdrop-filter: blur(12px);
	border-top: 1rpx solid #f0f0f0;
}

.submit-btn {
	height: 96rpx;
	background: linear-gradient(135deg, #c0527a, #d4688a);
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 28rpx rgba(212, 104, 138, 0.3);
}

.submit-btn.is-submitting {
	opacity: 0.55;
}

.submit-txt {
	font-size: 30rpx;
	color: #ffffff;
	letter-spacing: 4rpx;
	font-weight: 500;
}
</style>
