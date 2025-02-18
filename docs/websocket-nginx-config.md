# WebSocket Nginx 配置方案

## 问题描述

当前WebSocket连接失败的原因是Nginx配置未正确处理WebSocket协议升级请求。错误日志显示：
```
http miss file=./objs/nginx/html/ws, pattern=/, upath=/ws
client disconnect peer. ret=1007
```

## 解决方案

### 1. Nginx WebSocket配置

需要在Nginx配置文件中添加以下配置来支持WebSocket：

```nginx
# WebSocket配置
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 8080;
    server_name localhost;

    # WebSocket路径配置
    location /ws {
        proxy_pass http://your_backend_ws_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # WebSocket超时设置
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # 其他location配置...
}
```

### 2. 配置说明

1. `map $http_upgrade $connection_upgrade`
   - 用于处理WebSocket协议升级
   - 当有upgrade请求时设置connection为upgrade
   - 否则设置为close

2. `proxy_http_version 1.1`
   - 使用HTTP/1.1协议，这是WebSocket所需的

3. `proxy_set_header`设置
   - 设置必要的头信息用于WebSocket握手
   - 传递客户端信息到后端服务器

4. 超时设置
   - `proxy_read_timeout`: 读取超时时间
   - `proxy_send_timeout`: 发送超时时间

## 实施步骤

1. 检查当前Nginx配置文件位置
```bash
nginx -t
```

2. 编辑Nginx配置文件
```bash
sudo vim /etc/nginx/conf.d/default.conf  # 或者你的配置文件位置
```

3. 添加上述WebSocket配置

4. 测试配置是否正确
```bash
sudo nginx -t
```

5. 重新加载Nginx配置
```bash
sudo nginx -s reload
```

## 验证方法

1. 检查Nginx错误日志
```bash
tail -f /var/log/nginx/error.log
```

2. 使用前端WebSocket客户端测试连接
```javascript
const ws = new WebSocket('ws://localhost:8088/ws');
ws.onopen = () => console.log('Connected');
ws.onerror = (error) => console.error('WebSocket error:', error);
```

## 常见问题

1. 如果仍然连接失败，检查：
   - 后端WebSocket服务是否正常运行
   - 端口是否正确开放
