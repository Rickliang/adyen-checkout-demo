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

在 `.env` 填入你的 Adyen test credentials:

Fill `.env` with your Adyen test credentials:

```text
ADYEN_API_KEY=
ADYEN_MERCHANT_ACCOUNT=
ADYEN_CLIENT_KEY=
```

确保 Client Key 已允许 `http://localhost:8080`。

Make sure the Client Key allows `http://localhost:8080`.
