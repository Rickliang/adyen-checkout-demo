# Adyen 支付演示

[English](./README.md)

![screenshot](docs/screenshot.png)

一个超轻量的 Adyen 测试支付演示。切换 Sessions/Advanced 流程、Drop-in/单组件，在开发者面板查看请求、响应和事件。

## 快速开始

```bash
npm install
cp .env.example .env
# 编辑 .env 填入你的 Adyen 凭证
npm start
```

访问：http://localhost:8080

## 环境配置

详细设置说明请参考 [CONFIGURATION.md](./CONFIGURATION.md)。

**必需的环境变量：**

| 变量名 | 来源 |
|------|------|
| `ADYEN_API_KEY` | Adyen Customer Area > API credentials |
| `ADYEN_MERCHANT_ACCOUNT` | Adyen Customer Area |
| `ADYEN_CLIENT_KEY` | Adyen Customer Area > API credentials |

**默认值**（代码中硬编码）：

- 环境：`test`
- API 版本：`v71`
- 端口：`8080`

## 仓库

[https://github.com/Rickliang/adyen-checkout-demo](https://github.com/Rickliang/adyen-checkout-demo)
