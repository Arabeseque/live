# OBS推流方案设计

## 1. 方案概述
使用OBS进行推流可以大大简化我们的实现，无需处理复杂的WebRTC逻辑。OBS提供了成熟的推流能力，我们只需要：
1. 配置SRS接收RTMP推流
2. 提供推流地址和密钥给主播
3. 使用flv.js拉流播放

## 2. 服务器配置

### 2.1 SRS RTMP配置（已具备）
```conf
listen              1935;    # RTMP默认端口
max_connections     1000;    # 最大连接数

vhost __defaultVhost__ {
    # RTMP配置已启用
}
```

## 3. 推流流程

### 3.1 OBS配置信息
- 服务器：`rtmp://your-server:1935/live`
- 串流密钥：`{streamId}`  (例如：`user_123`)

### 3.2 推流地址生成
```typescript
interface StreamConfig {
  rtmpUrl: string;     // 推流地址
  streamKey: string;   // 推流密钥
  playUrl: string;     // 播放地址
}

// 生成推流配置
function generateStreamConfig(userId: string): StreamConfig {
  const streamKey = `user_${userId}`;
  return {
    rtmpUrl: `rtmp://${SERVER_HOST}:1935/live`,
    streamKey,
    playUrl: `http://${SERVER_HOST}:8080/live/${streamKey}.flv`
  };
}
```

## 4. 具体实现步骤

### 4.1 后端API（1天）
```typescript
interface StreamAPI {
  // 获取推流配置
  getStreamConfig(): Promise<StreamConfig>;

  // 更新直播状态
  updateStreamStatus(status: 'live' | 'ended'): Promise<void>;

  // 获取直播间信息
  getRoomInfo(roomId: string): Promise<RoomInfo>;
}
```

### 4.2 前端实现（2天）

1. 主播端页面
```typescript
interface BroadcasterView {
  // 显示OBS配置信息
  showStreamConfig(): void;

  // 复制推流配置到剪贴板
  copyConfig(): void;

  // 更新直播状态
  updateStatus(status: 'live' | 'ended'): void;
}
```

2. 观众端页面
```typescript
interface ViewerView {
  // 使用flv.js播放直播流
  startPlaying(playUrl: string): void;

  // 显示直播状态
  showStreamStatus(status: StreamStatus): void;
}
```

## 5. OBS教程文档

### 5.1 OBS设置步骤
1. 下载并安装OBS Studio
2. 打开OBS设置 > 推流
3. 选择自定义推流服务器
4. 填入推流地址和串流密钥
5. 设置输出质量（建议：）
   - 编码：x264
   - 比特率：2500-4000 Kbps
   - 关键帧间隔：2秒
   - CPU使用预设：veryfast

### 5.2 常见问题解决
1. 推流错误检查清单
2. 性能优化建议
3. 网络问题处理

## 6. 时间预估
- 后端API实现：1天
- 前端页面开发：2天
- 文档和教程：1天
总计：4天

## 7. 优势
1. 利用OBS成熟的推流能力
2. 无需维护复杂的WebRTC栈
3. 更稳定可靠
4. 主播可以使用OBS强大的场景功能
5. 降低服务器负载

## 8. 后续优化（可选）
1. 添加推流状态监控
2. 实现自动化测试
3. 优化播放器体验
4. 添加直播预览
5. 集成弹幕系统
