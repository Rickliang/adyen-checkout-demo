# Adyen Checkout Demo

![screenshot](docs/screenshot.png)

一个超轻量的 Adyen 测试支付演示。你可以切换 Sessions / Advanced、Drop-in / 单组件，并在开发者面板查看请求、响应和事件。

A tiny Adyen test checkout demo. Switch Sessions / Advanced, Drop-in / single components, and inspect requests, responses, and events in the developer panel.

## 快速开始 / Quick start

```bash
npm install
cp .env.example .env
npm start
```

打开 / Open:

```text
http://localhost:8080
```

## 配置 / Config

### 环境 / Environment

- **默认环境 / Default environment**: `test` (Adyen test-environment)
- **API 版本 / API version**: `v71`

### 本地开发 / Local Development

在 `.env` 填入你的 Adyen test credentials:

Fill `.env` with your Adyen test credentials:

```text
ADYEN_API_KEY=YOUR_TEST_API_KEY
ADYEN_MERCHANT_ACCOUNT=YOUR_MERCHANT_ACCOUNT
ADYEN_CLIENT_KEY=test_YOUR_CLIENT_KEY
```

确保 Client Key 的 "Allowed origins" 包含 `http://localhost:8080`。

Make sure the Client Key's "Allowed origins" includes `http://localhost:8080`.

### Netlify 部署 / Netlify Deployment

在 Netlify Site settings > Build & deploy > Environment 中设置以下环境变量：

Set these environment variables in Netlify Site settings > Build & deploy > Environment:

| 变量名 / Variable | 说明 / Description |
|---------|---------|
| `ADYEN_API_KEY` | 从 Adyen Customer Area 获取 / Get from Adyen Customer Area |
| `ADYEN_MERCHANT_ACCOUNT` | 商户账号 / Merchant account name |
| `ADYEN_CLIENT_KEY` | 客户端密钥（需添加 Netlify URL 到允许域名） / Client Key (add Netlify URL to allowed origins) |

部署后，将 Netlify 网站 URL（如 `https://yourapp.netlify.app`）添加到 Adyen Client Key 的 "Allowed origins" 中。

After deployment, add your Netlify site URL (e.g., `https://yourapp.netlify.app`) to the Client Key's "Allowed origins" in Adyen.
