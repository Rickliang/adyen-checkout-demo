/* Adyen interactive checkout demo — Sessions vs Advanced flow, Drop-in vs Card. */

const I18N = {
  zh: {
    title: 'Adyen 接入演示',
    credMissing: '未检测到 Adyen 凭证，请在 .env 中填写后重启服务。缺少：',
    cfgTitle: '参数配置',
    integration: '接入方式',
    flowSessionsHint: '(推荐，后端一次 /sessions)',
    flowAdvancedHint: '(手动 /payments + /details)',
    component: '组件类型',
    dropinHint: '(全部支付方式)',
    cardHint: '(单独卡组件)',
    amount: '金额',
    currency: '币种',
    country: '国家',
    locale: '语言',
    params: '前端参数',
    showPayHint: '(组件内置付款按钮)',
    openFirstHint: '(默认展开第一个)',
    allowed: 'allowedPaymentMethods',
    allowedHint: '(逗号分隔，仅 Advanced)',
    apply: '初始化',
    testCards: '测试卡',
    cart: '购物车',
    item: '演示商品',
    total: '合计',
    pay: '支付',
    loading: '加载中...',
    devPanel: '开发者面板',
    tabTraffic: '流量',
    tabEvents: '事件',
    resultAuthorised: '支付成功 (Authorised)',
    resultRefused: '支付被拒 (Refused)',
    resultPending: '待处理 (Pending)',
    resultReceived: '已接收 (Received)',
    resultError: '发生错误',
    resultCancelled: '已取消 (Cancelled)',
    clickToFill: '点击选择此测试卡（自动复制卡号）',
    originHint:
      '提示：该错误通常是 Client Key 未授权当前域名。请到 Adyen Customer Area > Developers > API credentials，选中此 Client Key 的凭证，在 Client settings > Allowed origins 添加 http://localhost:8080 并保存（可能需要几分钟生效）。',
    testCardHelper: '测试卡快速填写',
    cardNumber: '卡号',
    expiry: '有效期',
    tchHint: '↑ 点击 Copy 复制后粘贴到上方对应输入框（安全字段为 Adyen 跨域 iframe，无法直接写入）',
    copied: '已复制',
  },
  en: {
    title: 'Adyen Integration Demo · Test',
    credMissing: 'No Adyen credentials detected. Fill .env and restart. Missing: ',
    cfgTitle: 'Configuration',
    integration: 'Integration flow',
    flowSessionsHint: '(recommended, single /sessions)',
    flowAdvancedHint: '(manual /payments + /details)',
    component: 'Component',
    dropinHint: '(all payment methods)',
    cardHint: '(standalone card)',
    amount: 'Amount',
    currency: 'Currency',
    country: 'Country',
    locale: 'Locale',
    params: 'UI parameters',
    showPayHint: '(built-in pay button)',
    openFirstHint: '(expand first method)',
    allowed: 'allowedPaymentMethods',
    allowedHint: '(comma separated, Advanced only)',
    apply: 'Initialize / Apply',
    testCards: 'Test cards',
    cart: 'Your cart',
    item: 'Demo product',
    total: 'Total',
    pay: 'Payment',
    loading: 'Loading...',
    devPanel: 'Developer panel',
    tabTraffic: 'Traffic',
    tabEvents: 'Events',
    resultAuthorised: 'Payment authorised',
    resultRefused: 'Payment refused',
    resultPending: 'Pending',
    resultReceived: 'Received',
    resultError: 'An error occurred',
    resultCancelled: 'Cancelled',
    clickToFill: 'Click to select this test card (auto-copies number)',
    originHint:
      'Hint: this usually means the Client Key is not authorized for this domain. In Adyen Customer Area > Developers > API credentials, open the credential for this Client Key and add http://localhost:8080 under Client settings > Allowed origins, then save (may take a few minutes).',
    testCardHelper: 'Test card quick-fill',
    cardNumber: 'Card number',
    expiry: 'Expiry',
    tchHint: '↑ Click Copy then paste into the field above (secured fields are Adyen cross-origin iframes and cannot be written directly)',
    copied: 'Copied',
  },
};

const HINTS = {
  flowSessions: {
    zh: { s: '由 Adyen 托管支付流程，后端接入更简单。', l: 'Sessions 适合想快速上线的接入方式。你的后端只需要创建一次 session，之后支付过程中的状态、跳转和部分细节由 Adyen 组件接管。它适合标准 checkout，也方便商户先理解完整支付链路。' },
    en: { s: 'Adyen hosts the payment flow; simplest backend integration.', l: 'Sessions is the fastest way to go live. Your backend only creates a session once, then Adyen components take over state, redirects and most details during payment. Great for standard checkout and for understanding the full flow first.' },
  },
  flowAdvanced: {
    zh: { s: '前后端可完全控制，适合复杂支付场景。', l: 'Advanced 适合需要更多控制权的场景。你可以在前端触发 submit，在后端显式调用 paymentMethods、payments 和 details，更容易插入风控、订单校验、日志追踪和自定义错误处理。' },
    en: { s: 'Full front/back control; suited to complex payment cases.', l: 'Advanced gives you more control. You trigger submit on the frontend and explicitly call paymentMethods, payments and details on the backend, making it easier to add risk checks, order validation, logging and custom error handling.' },
  },
  compDropin: {
    zh: { s: '使用预置界面，自动展示可用支付方式。', l: 'Drop-in 是最完整的预置支付界面。它会根据 merchant 配置、国家、币种和浏览器能力展示多个支付方式，适合演示“商户上线后用户看到的整体支付体验”。' },
    en: { s: 'Prebuilt UI that auto-lists available payment methods.', l: 'Drop-in is the most complete prebuilt UI. It shows multiple payment methods based on your merchant config, country, currency and browser capabilities, ideal for demoing the full shopper experience after go-live.' },
  },
  compSingle: {
    zh: { s: '只渲染指定支付方式，例如信用卡或 PayPal。', l: 'Single Component 只渲染一个支付方式，例如 Card、PayPal 或 Klarna。它适合逐个排查支付方式，也适合商户已有自己的 checkout 页面，只想把某个 Adyen 组件嵌入进去。' },
    en: { s: 'Renders only one method, e.g. card or PayPal.', l: 'Single Component renders just one payment method such as Card, PayPal or Klarna. Handy for testing methods one by one, or when you already have your own checkout page and only want to embed a single Adyen component.' },
  },
  showPayButton: {
    zh: { s: '是否显示组件自带的付款按钮。', l: 'showPayButton 决定组件是否显示自己的付款按钮。开启时体验更接近开箱即用；关闭时通常需要商户页面自己提供按钮，并调用组件提交逻辑。' },
    en: { s: 'Whether the component shows its own pay button.', l: 'showPayButton controls whether the component renders its own pay button. On feels more out-of-the-box; off usually means your page provides the button and calls the component submit logic itself.' },
  },
  openFirst: {
    zh: { s: '进入页面后自动展开第一个支付方式。', l: 'openFirstPaymentMethod 会让第一个支付方式默认展开。适合减少用户点击，也方便测试人员刷新页面后直接看到第一个支付方式的字段状态。' },
    en: { s: 'Auto-expand the first payment method on load.', l: 'openFirstPaymentMethod expands the first payment method by default. Reduces shopper clicks and lets testers see the first method’s fields immediately after a page refresh.' },
  },
  holderName: {
    zh: { s: '是否显示持卡人姓名字段。', l: 'holderName 会在 Card 里显示持卡人姓名字段。某些商户希望采集更完整的持卡信息，用于订单记录、风控或客服排查。' },
    en: { s: 'Whether to show the cardholder name field.', l: 'holderName shows the cardholder name field in the Card component. Some merchants collect fuller card details for order records, risk checks or customer support.' },
  },
  enableStoreDetails: {
    zh: { s: '是否显示“保存支付详情以备下次使用”。', l: 'enableStoreDetails 会显示保存支付详情的选项。真实生产使用通常还需要 shopperReference 等 shopper 信息配合，这里主要用于观察前端 UI 的变化。' },
    en: { s: 'Whether to show “save payment details for next time”.', l: 'enableStoreDetails shows the save-details option. Real production use also needs shopper info such as shopperReference; here it mainly lets you observe the frontend UI change.' },
  },
  hideCVC: {
    zh: { s: '隐藏卡片背面的安全码字段。', l: 'hideCVC 会隐藏安全码字段。它一般只适合特定存卡、低风险或复用支付方式的测试场景，不建议在普通新卡支付里随意开启。' },
    en: { s: 'Hide the security code (CVC) field.', l: 'hideCVC hides the security-code field. Usually only suitable for stored-card, low-risk or reused payment-method tests; not recommended for normal new-card payments.' },
  },
  billingAddressRequired: {
    zh: { s: '要求填写完整账单地址。', l: 'billingAddressRequired 会要求用户填写完整账单地址。它常用于风控、发票、地区合规或部分卡组织规则相关的场景。' },
    en: { s: 'Require the shopper to enter a full billing address.', l: 'billingAddressRequired forces the shopper to enter a full billing address. Often used for risk, invoicing, regional compliance or certain card-scheme rules.' },
  },
  challengeWindowSize: {
    zh: { s: '设置 3DS 验证窗口大小。', l: 'challengeWindowSize 控制 3DS 挑战验证窗口尺寸。不同尺寸会影响银行验证页的展示空间，适合演示 3DS 用户体验差异。' },
    en: { s: 'Set the 3DS challenge window size.', l: 'challengeWindowSize controls the 3DS challenge window dimensions. Different sizes affect how the bank’s verification page is shown, useful for demoing 3DS UX differences.' },
  },
  brands: {
    zh: { s: '限制 Card 组件允许展示的卡品牌，留空表示不限制。', l: 'brands 限制 Card 组件允许展示的卡品牌，例如只允许 visa、mc。留空表示不限制，按商户支持的品牌自动展示。' },
    en: { s: 'Limit which card brands the Card component allows; empty = all.', l: 'brands limits which card brands the Card component accepts, e.g. only visa, mc. Leave empty to allow all brands supported by your merchant account.' },
  },
  showBrandIcon: {
    zh: { s: '是否在卡号输入框右侧显示识别到的卡品牌图标。', l: 'showBrandIcon 控制是否在卡号输入框旁显示识别到的卡品牌图标。关闭后界面更简洁，但用户看不到实时的卡品牌反馈。' },
    en: { s: 'Show the detected card brand icon next to the number field.', l: 'showBrandIcon controls whether the detected card-brand icon appears next to the card number field. Turning it off is cleaner but removes real-time brand feedback for shoppers.' },
  },
  enableScanning: {
    zh: { s: '在支持的移动设备上启用扫码/扫描卡片能力。', l: 'enableScanning 在支持的移动设备上启用扫描实体卡片的能力，让用户无需手动输入卡号，适合移动端体验演示。' },
    en: { s: 'Enable card scanning on supported mobile devices.', l: 'enableScanning turns on physical-card scanning on supported mobile devices so shoppers avoid typing the card number, useful for mobile UX demos.' },
  },
  billingAddressMode: {
    zh: { s: '控制账单地址采集模式，full 会展示更完整地址字段。', l: 'billingAddressMode 控制账单地址采集方式：partial 只采集少量字段，full 展示更完整的地址表单。用于平衡转化率与风控需求。' },
    en: { s: 'Control billing address capture; full shows more fields.', l: 'billingAddressMode controls billing address capture: partial collects few fields, full shows a more complete address form. Balances conversion against risk needs.' },
  },
  showRemovePaymentMethodButton: {
    zh: { s: '在存在 stored payment methods 时显示删除按钮。', l: 'showRemovePaymentMethodButton 在有已保存支付方式时显示删除按钮，让用户可以移除保存过的卡片，常用于账户/钱包管理场景。' },
    en: { s: 'Show a remove button for stored payment methods.', l: 'showRemovePaymentMethodButton shows a delete button when stored payment methods exist, letting shoppers remove saved cards. Common in account/wallet management flows.' },
  },
  showStoredPaymentMethods: {
    zh: { s: '是否展示用户已保存的支付方式。', l: 'showStoredPaymentMethods 控制是否在 Drop-in 顶部展示用户已保存的支付方式。关闭后每次都当作新支付方式处理。' },
    en: { s: 'Whether to display the shopper’s stored payment methods.', l: 'showStoredPaymentMethods controls whether Drop-in shows the shopper’s saved payment methods at the top. When off, every payment is treated as a new method.' },
  },
  walletButtonType: {
    zh: { s: '控制钱包按钮文案/样式，适用于 Apple Pay 或 Google Pay 测试。', l: 'buttonType 控制 Apple Pay / Google Pay 钱包按钮的文案与样式，例如 buy、pay、checkout，用于匹配不同下单场景的按钮语义。' },
    en: { s: 'Control wallet button label/style for Apple Pay or Google Pay.', l: 'buttonType controls the Apple Pay / Google Pay wallet button label and style, e.g. buy, pay, checkout, to match the semantics of different ordering scenarios.' },
  },
  walletButtonColor: {
    zh: { s: '控制钱包按钮颜色，不同钱包支持值可能略有差异。', l: 'buttonColor 控制钱包按钮的颜色，例如 black、white。不同钱包支持的取值可能略有差异，用于适配页面深浅色背景。' },
    en: { s: 'Control wallet button color; supported values vary by wallet.', l: 'buttonColor controls the wallet button color, e.g. black, white. Supported values can vary by wallet, useful for matching light or dark page backgrounds.' },
  },
  presetCards: {
    zh: { s: '点击后复制卡号，不改变当前组件。', l: '测试卡用于快速复制卡号。点击后不会改变当前组件，只会复制卡号；有效期和 CVC 直接显示在灰字里，方便粘贴到 Adyen 安全输入框。' },
    en: { s: 'Click to copy the card number; the component is unchanged.', l: 'Test cards let you quickly copy a card number. Clicking does not change the current component, it only copies the number; expiry and CVC are shown in the gray text for pasting into Adyen secured fields.' },
  },
  amountCurrency: {
    zh: { s: '修改金额和币种后，会立即更新购物车总计。', l: '金额或币种变化会重新请求可用支付方式。这样可以快速观察不同币种、金额组合下，前端展示的支付方式是否发生变化。' },
    en: { s: 'Changing amount and currency updates the cart total instantly.', l: 'Changing amount or currency re-requests available payment methods, so you can quickly see how the displayed methods change across different currency and amount combinations.' },
  },
};

const HINT_EXTRA = {
  flowSessions: {
    fe: { zh: '调用 AdyenCheckout({ session }) 并挂载 Drop-in / 组件。', en: 'Calls AdyenCheckout({ session }) and mounts Drop-in / component.' },
    be: { zh: 'POST /sessions：一次创建会话，返回 id + sessionData。', en: 'POST /sessions: create once, returns id + sessionData.' },
  },
  flowAdvanced: {
    fe: { zh: '前端依次触发 paymentMethods、onSubmit、onAdditionalDetails 回调。', en: 'Frontend triggers paymentMethods, onSubmit and onAdditionalDetails callbacks.' },
    be: { zh: 'POST /paymentMethods → POST /payments → POST /payments/details。', en: 'POST /paymentMethods → POST /payments → POST /payments/details.' },
  },
  compDropin: {
    fe: { zh: "checkout.create('dropin') 挂载全部支付方式。", en: "checkout.create('dropin') mounts all payment methods." },
    be: { zh: '沿用 /sessions 或 /payments 接口，无额外字段。', en: 'Reuses the /sessions or /payments endpoints, no extra fields.' },
  },
  compSingle: {
    fe: { zh: "checkout.create(type)（如 'card'）只挂载单个组件。", en: "checkout.create(type) e.g. 'card' mounts a single component." },
    be: { zh: '请求里的 paymentMethod.type 固定为所选类型。', en: 'paymentMethod.type in the request is fixed to the chosen type.' },
  },
  showPayButton: {
    fe: { zh: 'dropin / 组件的 showPayButton 选项。', en: 'The showPayButton option on dropin / component.' },
    be: { zh: '纯前端 UI，不改变后端请求字段。', en: 'Frontend-only UI; no backend request field.' },
  },
  openFirst: {
    fe: { zh: 'dropin 的 openFirstPaymentMethod 选项。', en: 'The openFirstPaymentMethod option on dropin.' },
    be: { zh: '纯前端 UI，不改变后端请求字段。', en: 'Frontend-only UI; no backend request field.' },
  },
  holderName: {
    fe: { zh: 'card 的 hasHolderName / holderNameRequired。', en: 'card hasHolderName / holderNameRequired.' },
    be: { zh: '持卡人姓名进入 paymentMethod.holderName 一并发送。', en: 'Cardholder name is sent inside paymentMethod.holderName.' },
  },
  enableStoreDetails: {
    fe: { zh: 'card 的 enableStoreDetails；勾选后 state 带 storePaymentMethod=true。', en: 'card enableStoreDetails; once ticked state carries storePaymentMethod=true.' },
    be: { zh: '触发 storePaymentMethod + shopperReference + recurringProcessingModel=CardOnFile + shopperInteraction=Ecommerce（本 demo 自动补齐）。', en: 'Triggers storePaymentMethod + shopperReference + recurringProcessingModel=CardOnFile + shopperInteraction=Ecommerce (auto-added by this demo).' },
  },
  hideCVC: {
    fe: { zh: 'card 的 hideCVC 选项。', en: 'card hideCVC option.' },
    be: { zh: '纯前端 UI；影响是否采集 CVC，不新增字段。', en: 'Frontend-only UI; affects CVC capture, adds no field.' },
  },
  billingAddressRequired: {
    fe: { zh: 'card 的 billingAddressRequired。', en: 'card billingAddressRequired.' },
    be: { zh: '采集到的地址进入请求的 billingAddress 对象。', en: 'Collected address is sent as the billingAddress object.' },
  },
  challengeWindowSize: {
    fe: { zh: '通过 reqBody 传给后端用于 3DS2 请求。', en: 'Passed to the backend via reqBody for the 3DS2 request.' },
    be: { zh: 'authenticationData.threeDSRequestData.challengeWindowSize。', en: 'authenticationData.threeDSRequestData.challengeWindowSize.' },
  },
  brands: {
    fe: { zh: 'card 的 brands 数组。', en: 'card brands array.' },
    be: { zh: '纯前端限制；后端仍按实际卡 BIN 处理。', en: 'Frontend-only restriction; backend still resolves by real card BIN.' },
  },
  showBrandIcon: {
    fe: { zh: 'card 的 showBrandIcon。', en: 'card showBrandIcon.' },
    be: { zh: '纯前端 UI，不改变后端请求字段。', en: 'Frontend-only UI; no backend request field.' },
  },
  enableScanning: {
    fe: { zh: 'card 的 enableScanning。', en: 'card enableScanning.' },
    be: { zh: '纯前端 UI，不改变后端请求字段。', en: 'Frontend-only UI; no backend request field.' },
  },
  billingAddressMode: {
    fe: { zh: 'card 的 billingAddressMode（partial / full）。', en: 'card billingAddressMode (partial / full).' },
    be: { zh: '影响 billingAddress 采集的字段数量。', en: 'Affects how many billingAddress fields are collected.' },
  },
  showRemovePaymentMethodButton: {
    fe: { zh: 'dropin 的 showRemovePaymentMethodButton。', en: 'dropin showRemovePaymentMethodButton.' },
    be: { zh: '删除动作对应 disable stored payment method 接口（本 demo 未实现）。', en: 'Removal maps to the disable stored payment method API (not implemented here).' },
  },
  showStoredPaymentMethods: {
    fe: { zh: 'dropin 的 showStoredPaymentMethods。', en: 'dropin showStoredPaymentMethods.' },
    be: { zh: '需请求带 shopperReference 才会返回 storedPaymentMethods。', en: 'Requires shopperReference in the request to return storedPaymentMethods.' },
  },
  walletButtonType: {
    fe: { zh: 'paywithgoogle / applepay 的 buttonType。', en: 'paywithgoogle / applepay buttonType.' },
    be: { zh: '纯前端 UI，不改变后端请求字段。', en: 'Frontend-only UI; no backend request field.' },
  },
  walletButtonColor: {
    fe: { zh: 'paywithgoogle / applepay 的 buttonColor。', en: 'paywithgoogle / applepay buttonColor.' },
    be: { zh: '纯前端 UI，不改变后端请求字段。', en: 'Frontend-only UI; no backend request field.' },
  },
  presetCards: {
    fe: { zh: '仅复制卡号到剪贴板，不改动组件配置。', en: 'Only copies the number to clipboard; no component config change.' },
    be: { zh: '无后端字段。', en: 'No backend field.' },
  },
  amountCurrency: {
    fe: { zh: '更新 amount.value 与 amount.currency 并重新初始化。', en: 'Updates amount.value and amount.currency then re-initializes.' },
    be: { zh: 'amount.value + amount.currency（/sessions、/paymentMethods、/payments 均带）。', en: 'amount.value + amount.currency (sent on /sessions, /paymentMethods, /payments).' },
  },
};

const TEST_CARDS = [
  { label: 'Visa', icon: '💳', number: '4111 1111 1111 1111', expiry: '03/30', cvc: '737' },
  { label: 'Mastercard', icon: '💳', number: '5577 0000 5577 0004', expiry: '03/30', cvc: '737' },
  { label: 'Amex', icon: '💳', number: '3700 0000 0000 002', expiry: '03/30', cvc: '7373' },
  { label: '3DS2 Visa', icon: '🔐', number: '4917 6100 0000 0000', expiry: '03/30', cvc: '737', note: 'pwd: password' },
  { label: 'Refused', icon: '❌', number: '4000 0000 0000 0119', expiry: '03/30', cvc: '737', note: 'always refused' },
];

const COUNTRIES = [
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'CN', flag: '🇨🇳', name: 'China' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
];

const DECIMALS = { JPY: 0, KRW: 0 };
const SYMBOLS = { EUR: '€', USD: '$', GBP: '£', CNY: '¥', JPY: '¥', AUD: 'A$', BRL: 'R$' };

let lang = 'zh';
let appConfig = null;
let currentComponent = null;
let selectedTestCard = TEST_CARDS[0];
let buildTimer = null;

/* ---------- helpers ---------- */
function t(key) {
  return (I18N[lang] && I18N[lang][key]) || key;
}

function toMinor(major, currency) {
  const d = DECIMALS[currency] ?? 2;
  return Math.round(parseFloat(major || '0') * Math.pow(10, d));
}

function fmtAmount(major, currency) {
  const sym = SYMBOLS[currency] || '';
  const d = DECIMALS[currency] ?? 2;
  return `${sym}${Number(major || 0).toFixed(d)}`;
}

function $(id) {
  return document.getElementById(id);
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- collapsible JSON renderer ---------- */
function renderJson(val, depth) {
  depth = depth || 0;
  if (val === null) return '<span class="jn">null</span>';
  if (typeof val === 'boolean') return `<span class="jb">${val}</span>`;
  if (typeof val === 'number') return `<span class="ji">${val}</span>`;
  if (typeof val === 'string') {
    const trunc =
      val.length > 200 ? escHtml(val.slice(0, 200)) + '<span class="jel">…</span>' : escHtml(val);
    return `<span class="js">"${trunc}"</span>`;
  }
  if (Array.isArray(val)) {
    if (!val.length) return '<span class="jbrace">[]</span>';
    const rows = val
      .map((v, i) => `<div class="jrow">${renderJson(v, depth + 1)}${i < val.length - 1 ? ',' : ''}</div>`)
      .join('');
    return `<details class="jnode"${depth === 0 ? ' open' : ''}><summary class="jbrace">[${val.length} items]</summary><div class="jbody">${rows}</div></details>`;
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val);
    if (!keys.length) return '<span class="jbrace">{}</span>';
    const rows = keys
      .map(
        (k, i) =>
          `<div class="jrow"><span class="jk">"${escHtml(k)}"</span>: ${renderJson(val[k], depth + 1)}${i < keys.length - 1 ? ',' : ''}</div>`
      )
      .join('');
    return `<details class="jnode"${depth === 0 ? ' open' : ''}><summary class="jbrace">{${keys.length} keys}</summary><div class="jbody">${rows}</div></details>`;
  }
  return escHtml(String(val));
}

/* ---------- i18n ---------- */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (I18N[lang][key]) el.textContent = I18N[lang][key];
  });
  document.querySelectorAll('.eli5[data-hint]').forEach((el) => {
    const hint = HINTS[el.getAttribute('data-hint')];
    if (hint && hint[lang]) el.textContent = hint[lang].s;
  });
  $('langToggle').textContent = lang === 'zh' ? 'EN' : '中文';
  renderTestCards();
}

/* ---------- consolidated console log ---------- */
function addConsoleLine(targetId, type, title, data, isError = false, lineClass = '') {
  const container = $(targetId);
  const line = document.createElement('div');
  line.className = `cl-line ${lineClass}${isError ? ' err-line' : ''}`;
  
  const time = new Date().toLocaleTimeString([], { hour12: false });
  const typeClass = type.toLowerCase() + (isError ? ' err' : '');
  
  line.innerHTML = `
    <div class="cl-header">
      <span class="cl-time">${time}</span>
      <span class="cl-type ${typeClass}">${escHtml(type)}</span>
      <span class="cl-title">${escHtml(title)}</span>
    </div>
    <div class="cl-content hidden">${renderJson(data, 0)}</div>
  `;
  
  const header = line.querySelector('.cl-header');
  const content = line.querySelector('.cl-content');
  header.onclick = () => content.classList.toggle('hidden');
  
  container.prepend(line);
  container.scrollTop = 0;
  return (updateData, updateTitle, updateError = false) => {
    if (updateTitle) line.querySelector('.cl-title').textContent = updateTitle;
    if (updateError) {
      line.querySelector('.cl-type').classList.add('err');
      line.classList.add('err-line');
    }
    content.innerHTML = renderJson(updateData, 0);
    // auto-expand responses if they contain an error
    if (updateError) content.classList.remove('hidden');
  };
}

function compactEndpoint(endpoint) {
  return endpoint.replace(/\s+→\s+Adyen\s+POST\s+/, ' → ');
}

function compactRequest(body) {
  const out = {};
  ['amount', 'currency', 'countryCode', 'shopperLocale', 'allowedPaymentMethods'].forEach((key) => {
    if (body[key] !== undefined && body[key] !== null && body[key] !== '') out[key] = body[key];
  });
  const pm = (body.stateData && body.stateData.paymentMethod) || body.paymentMethod;
  if (pm) {
    out.paymentMethod = pm.type;
    if (pm.storedPaymentMethodId) out.storedPaymentMethodId = pm.storedPaymentMethodId;
  }
  const details = (body.stateData && body.stateData.details) || body.details;
  if (details) out.details = Object.keys(details);
  if (body.threeDS2RequestData || body.enableStoreDetails !== undefined) {
    // keep original hints
  }
  if (
    body.storePaymentMethod ||
    body.stateData?.storePaymentMethod ||
    body.stateData?.paymentMethod?.storePaymentMethod
  ) {
    out.storePaymentMethod = true;
  }
  ['shopperReference', 'recurringProcessingModel', 'shopperInteraction'].forEach((key) => {
    if (body[key]) out[key] = body[key];
  });
  const cws =
    body.challengeWindowSize || body.authenticationData?.threeDSRequestData?.challengeWindowSize;
  if (cws) out.challengeWindowSize = cws;
  if (body.redirectResult) {
    out.redirectResult = 'present';
  }
  return out;
}

function compactResponse(resp) {
  const body = resp && resp.response ? resp.response : resp || {};
  const out = {};
  if (resp && resp.status) out.status = resp.status;
  ['resultCode', 'refusalReason', 'message', 'errorCode', 'pspReference'].forEach((key) => {
    if (body[key] !== undefined && body[key] !== null && body[key] !== '') out[key] = body[key];
  });
  if (body.action) out.action = body.action.type;
  if (body.paymentMethods) {
    out.paymentMethods = body.paymentMethods.map((method) => method.name || method.type);
  }
  if (body.id) out.sessionId = body.id;
  return Object.keys(out).length ? out : body;
}

function compactEventData(data) {
  const out = {};
  ['resultCode', 'message', 'name', 'flow', 'component', 'type', 'paymentMethod', 'action'].forEach((key) => {
    if (data && data[key] !== undefined && data[key] !== null && data[key] !== '') out[key] = data[key];
  });
  if (data && data.keys) out.keys = data.keys;
  return Object.keys(out).length ? out : data;
}

function addEvent(name, data) {
  addConsoleLine('console-events', 'EVENT', name, compactEventData(data), false, 'event-line');
}

function addTrafficEntry(endpoint, reqBody) {
  const container = $('console-network');
  const line = document.createElement('div');
  line.className = 'cl-line network-pair req-line';
  const time = new Date().toLocaleTimeString([], { hour12: false });
  const title = compactEndpoint(endpoint);
  line.innerHTML = `
    <div class="cl-header">
      <span class="cl-time">${time}</span>
      <span class="cl-title">${escHtml(title)}</span>
    </div>
    <div class="cl-content hidden">
      <div class="network-block req-block">
        <div class="network-block-title">Request</div>
        ${renderJson(compactRequest(reqBody), 0)}
      </div>
      <div class="network-block res-block pending">
        <div class="network-block-title">Response</div>
        <span class="jbrace">等待响应...</span>
      </div>
    </div>
  `;
  const header = line.querySelector('.cl-header');
  const content = line.querySelector('.cl-content');
  header.onclick = () => content.classList.toggle('hidden');
  container.prepend(line);
  container.scrollTop = 0;

  return (resp) => {
    const ok = resp && resp.ok !== false;
    const status = resp && resp.status ? ` [${resp.status}]` : '';
    const body = compactResponse(resp);
    line.classList.remove('req-line');
    line.classList.add(ok ? 'res-line' : 'err-line');
    if (resp && resp.request) {
      const reqBlock = line.querySelector('.req-block');
      if (reqBlock) {
        reqBlock.innerHTML = `
          <div class="network-block-title">Request → Adyen</div>
          ${renderJson(compactRequest(resp.request), 0)}
        `;
      }
    }
    line.querySelector('.cl-title').textContent = title + status;
    line.querySelector('.res-block').className = `network-block ${ok ? 'res-block' : 'err-block'}`;
    line.querySelector('.res-block, .err-block').innerHTML = `
      <div class="network-block-title">${ok ? 'Response' : 'Error response'}</div>
      ${renderJson(body, 0)}
    `;
    if (!ok) content.classList.remove('hidden');
  };
}

function setupDevTabs() {
  document.querySelectorAll('.dev-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dev-tab').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.console-log').forEach((log) => log.classList.add('hidden'));
      btn.classList.add('active');
      $(`console-${btn.dataset.devTab}`).classList.remove('hidden');
    });
  });
}

function switchTab() {} // No-op for compatibility

/* ---------- resizable panels ---------- */
function setupResizer() {
  setupDevTabs();
  const configResizer = $('configResizer');
  const devResizer = $('devResizer');
  const layout = document.querySelector('.layout');
  let dragging = null;

  configResizer.addEventListener('mousedown', (e) => {
    dragging = 'config';
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  });

  devResizer.addEventListener('mousedown', (e) => {
    dragging = 'dev';
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    if (dragging === 'config') {
      const width = e.clientX - 16;
      if (width > 260 && width < 620) {
        layout.style.setProperty('--cfg-width', `${width}px`);
      }
      return;
    }
    if (dragging === 'dev') {
      const width = window.innerWidth - e.clientX - 16;
      if (width > 300 && width < 1200) {
        layout.style.setProperty('--dev-width', `${width}px`);
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = null;
      document.body.style.cursor = '';
    }
  });
}

/* ---------- result ---------- */
function showResult(resultCode, detail) {
  const el = $('result');
  el.classList.remove('hidden', 'success', 'error', 'pending');
  const map = {
    Authorised: ['success', t('resultAuthorised')],
    Refused: ['error', t('resultRefused')],
    Error: ['error', t('resultError')],
    Cancelled: ['error', t('resultCancelled')],
    Pending: ['pending', t('resultPending')],
    Received: ['pending', t('resultReceived')],
  };
  const [cls, text] = map[resultCode] || ['pending', resultCode || '—'];
  el.classList.add(cls);
  el.textContent = detail ? `${text} · ${detail}` : text;
}

function showError(err) {
  const el = $('result');
  el.classList.remove('hidden', 'success', 'pending');
  el.classList.add('error');
  const msg = err && err.message ? err.message : String(err);
  let text = `${t('resultError')}: ${msg}`;
  if (/paymentMethods|403|origin/i.test(msg)) text += `\n\n${t('originHint')}`;
  el.style.whiteSpace = 'pre-line';
  el.textContent = text;
}

function clearResult() {
  $('result').classList.add('hidden');
}

function scheduleBuild(delay = 350) {
  if (!appConfig || !appConfig.configured) return;
  clearTimeout(buildTimer);
  buildTimer = setTimeout(build, delay);
}

/* ---------- controls ---------- */
function readControls() {
  const allowedRaw = $('allowed') ? $('allowed').value.trim() : '';
  const brandsRaw = $('brands') ? $('brands').value.trim() : '';
  return {
    flow: document.querySelector('input[name="flow"]:checked').value,
    component: document.querySelector('input[name="component"]:checked').value,
    componentType: $('componentType').value,
    amount: $('amount').value,
    currency: $('currency').value,
    country: $('country').value,
    locale: $('locale').value,
    showPayButton: $('showPayButton').checked,
    openFirstStored: $('openFirstStored').checked,
    hasHolderName: $('hasHolderName').checked,
    enableStoreDetails: $('enableStoreDetails').checked,
    hideCVC: $('hideCVC').checked,
    billingAddressRequired: $('billingAddressRequired').checked,
    brands: brandsRaw ? brandsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
    showBrandIcon: $('showBrandIcon') ? $('showBrandIcon').checked : true,
    enableScanning: $('enableScanning') ? $('enableScanning').checked : false,
    billingAddressMode: $('billingAddressMode') ? $('billingAddressMode').value : '',
    showRemovePaymentMethodButton: $('showRemovePaymentMethodButton') ? $('showRemovePaymentMethodButton').checked : false,
    showStoredPaymentMethods: $('showStoredPaymentMethods') ? $('showStoredPaymentMethods').checked : true,
    walletButtonType: $('walletButtonType') ? $('walletButtonType').value : '',
    walletButtonColor: $('walletButtonColor') ? $('walletButtonColor').value : '',
    challengeWindowSize: $('challengeWindowSize').value,
    allowed: allowedRaw ? allowedRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
  };
}

function updateCart() {
  const amount = $('amount').value;
  const currency = $('currency').value;
  const text = fmtAmount(amount, currency);
  $('cartAmount').textContent = text;
  $('cartTotal').textContent = text;
}

/* ---------- API helper ---------- */
async function api(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ---------- mounting ---------- */
function teardown() {
  if (currentComponent && currentComponent.unmount) {
    try {
      currentComponent.unmount();
    } catch (_) {}
  }
  currentComponent = null;
  $('payment-container').innerHTML = '';
  const helper = $('testCardHelper');
  if (helper) helper.classList.add('hidden');
}

function cardUiConfig(cfg) {
  const config = {
    hasHolderName: cfg.hasHolderName,
    holderNameRequired: cfg.hasHolderName,
    enableStoreDetails: cfg.enableStoreDetails,
    hideCVC: cfg.hideCVC,
    billingAddressRequired: cfg.billingAddressRequired,
    showBrandIcon: cfg.showBrandIcon,
    enableScanning: cfg.enableScanning,
  };
  if (cfg.brands.length) config.brands = cfg.brands;
  if (cfg.billingAddressMode) config.billingAddressMode = cfg.billingAddressMode;
  return config;
}

function walletUiConfig(cfg) {
  const config = {};
  if (cfg.walletButtonType) config.buttonType = cfg.walletButtonType;
  if (cfg.walletButtonColor) config.buttonColor = cfg.walletButtonColor;
  return config;
}

function paymentMethodsConfiguration(cfg) {
  return {
    card: cardUiConfig(cfg),
    paywithgoogle: walletUiConfig(cfg),
    applepay: walletUiConfig(cfg),
  };
}

function mountComponent(checkout, cfg) {
  const container = $('payment-container');
  if (cfg.component === 'dropin') {
    currentComponent = checkout.create('dropin', {
      showPayButton: cfg.showPayButton,
      openFirstPaymentMethod: cfg.openFirstStored,
      showRemovePaymentMethodButton: cfg.showRemovePaymentMethodButton,
      showStoredPaymentMethods: cfg.showStoredPaymentMethods,
    }).mount(container);
  } else {
    const type = cfg.componentType;
    const opts = { showPayButton: cfg.showPayButton };
    if (type === 'card') {
      Object.assign(opts, cardUiConfig(cfg));
    }
    if (type === 'paywithgoogle' || type === 'applepay') {
      Object.assign(opts, walletUiConfig(cfg));
    }
    currentComponent = checkout.create(type, opts).mount(container);
    if (type === 'card') showTestCardHelper();
  }
}

function handlePaymentResult(resp, comp) {
  addEvent('paymentResult', { resultCode: resp.resultCode, action: resp.action ? resp.action.type : null });
  if (resp.action && comp) {
    comp.handleAction(resp.action);
  } else {
    showResult(resp.resultCode, resp.refusalReason);
  }
}

/* ---------- Sessions flow ---------- */
async function buildSessions(cfg) {
  const reqBody = {
    amount: toMinor(cfg.amount, cfg.currency),
    currency: cfg.currency,
    countryCode: cfg.country,
    shopperLocale: cfg.locale,
    returnUrl: window.location.href,
    enableStoreDetails: cfg.enableStoreDetails,
  };
  const setRes = addTrafficEntry('POST /api/sessions  →  Adyen POST /sessions', reqBody);
  const data = await api('/api/sessions', reqBody);
  setRes(data);
  if (!data.response || !data.response.id) {
    throw new Error((data.response && data.response.message) || data.error || 'sessions failed');
  }
  const checkout = await window.AdyenCheckout({
    environment: appConfig.environment,
    clientKey: appConfig.clientKey,
    locale: cfg.locale,
    session: { id: data.response.id, sessionData: data.response.sessionData },
    paymentMethodsConfiguration: paymentMethodsConfiguration(cfg),
    onPaymentCompleted: (result) => {
      addEvent('onPaymentCompleted', result);
      showResult(result.resultCode);
    },
    onPaymentFailed: (result) => {
      addEvent('onPaymentFailed', result);
      showResult(result.resultCode || 'Error', result.message);
    },
    onError: (err) => {
      addEvent('onError', { message: err.message, name: err.name });
      showError(err);
    },
  });
  mountComponent(checkout, cfg);
}

/* ---------- Advanced flow ---------- */
async function buildAdvanced(cfg) {
  const amountMinor = toMinor(cfg.amount, cfg.currency);
  const pmReq = {
    amount: amountMinor,
    currency: cfg.currency,
    countryCode: cfg.country,
    shopperLocale: cfg.locale,
    allowedPaymentMethods: cfg.allowed,
    enableStoreDetails: cfg.enableStoreDetails,
  };
  const setPmRes = addTrafficEntry('POST /api/paymentMethods  →  Adyen POST /paymentMethods', pmReq);
  const pm = await api('/api/paymentMethods', pmReq);
  setPmRes(pm);
  if (!pm.response || !pm.response.paymentMethods) {
    throw new Error((pm.response && pm.response.message) || pm.error || 'paymentMethods failed');
  }

  const checkout = await window.AdyenCheckout({
    environment: appConfig.environment,
    clientKey: appConfig.clientKey,
    locale: cfg.locale,
    paymentMethodsResponse: pm.response,
    amount: { value: amountMinor, currency: cfg.currency },
    countryCode: cfg.country,
    paymentMethodsConfiguration: paymentMethodsConfiguration(cfg),
    onSubmit: async (state, comp) => {
      addEvent('onSubmit', { paymentMethod: state.data.paymentMethod.type });
      const reqBody = {
        stateData: state.data,
        amount: amountMinor,
        currency: cfg.currency,
        countryCode: cfg.country,
        returnUrl: window.location.href,
        origin: window.location.origin,
      };
      if (cfg.challengeWindowSize) {
        reqBody.challengeWindowSize = cfg.challengeWindowSize;
      }
      const setPayRes = addTrafficEntry('POST /api/payments  →  Adyen POST /payments', reqBody);
      const res = await api('/api/payments', reqBody);
      setPayRes(res);
      handlePaymentResult(res.response, comp);
    },
    onAdditionalDetails: async (state, comp) => {
      addEvent('onAdditionalDetails', { keys: Object.keys(state.data.details || {}) });
      const reqBody = { stateData: state.data };
      const setDetRes = addTrafficEntry('POST /api/payments/details  →  Adyen POST /payments/details', reqBody);
      const res = await api('/api/payments/details', reqBody);
      setDetRes(res);
      handlePaymentResult(res.response, comp);
    },
    onError: (err) => {
      addEvent('onError', { message: err.message, name: err.name });
      showError(err);
    },
  });
  mountComponent(checkout, cfg);
}

/* ---------- build ---------- */
async function build() {
  if (!appConfig) return;
  clearResult();
  teardown();
  const cfg = readControls();
  addEvent('init', { flow: cfg.flow, component: cfg.component, type: cfg.componentType });
  $('loading').classList.remove('hidden');
  try {
    if (cfg.flow === 'sessions') await buildSessions(cfg);
    else await buildAdvanced(cfg);
  } catch (err) {
    showError(err);
    addEvent('buildError', { message: String(err) });
  } finally {
    $('loading').classList.add('hidden');
  }
}

/* ---------- redirect return handling ---------- */
async function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const redirectResult = params.get('redirectResult');
  const sessionId = params.get('sessionId');
  if (!redirectResult) return false;

  try {
    if (sessionId) {
      const checkout = await window.AdyenCheckout({
        environment: appConfig.environment,
        clientKey: appConfig.clientKey,
        session: { id: sessionId },
        onPaymentCompleted: (result) => showResult(result.resultCode),
        onError: (err) => showError(err),
      });
      if (checkout.submitDetails) checkout.submitDetails({ details: { redirectResult } });
    } else {
      const setDetRes = addTrafficEntry('POST /api/payments/details (Redirect Return)', { redirectResult });
      const res = await api('/api/payments/details', { stateData: { details: { redirectResult } } });
      setDetRes(res);
      handlePaymentResult(res.response, null);
    }
  } catch (err) {
    showError(err);
  }
  window.history.replaceState({}, document.title, window.location.pathname);
  return true;
}

/* ---------- test cards ---------- */
function renderTestCards() {
  const ul = $('testCardList');
  if (!ul) return;
  ul.innerHTML = '';
  TEST_CARDS.forEach((c) => {
    const li = document.createElement('li');
    if (c === selectedTestCard) li.classList.add('tc-active');
    li.title = t('clickToFill');
    li.innerHTML = `<span class="tc-icon">${c.icon}</span> <code>${c.number}</code> <span class="tc-label">${c.label}</span> <span class="tc-meta" style="color:#888;font-size:0.9em;margin-left:4px;">${c.expiry} ${c.cvc}</span>${
      c.note ? ` <em class="tc-note">${c.note}</em>` : ''
    }`;
    li.addEventListener('click', () => {
      selectedTestCard = c;
      updateTestCardHelper();
      copyText(c.number.replace(/\s/g, ''), `📋 ${c.number}`);
    });
    ul.appendChild(li);
  });
}

function copyText(value, toastText) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(value).then(() => showCopyToast(toastText || t('copied'))).catch(() => {});
}

function showCopyToast(text) {
  const old = document.querySelector('.copy-toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

function showTestCardHelper() {
  const el = $('testCardHelper');
  if (!el) return;
  el.classList.remove('hidden');
  updateTestCardHelper();
  el.querySelectorAll('.tch-copy').forEach((btn) => {
    btn.onclick = () => {
      const field = btn.dataset.field;
      let value = '';
      if (field === 'number') value = selectedTestCard.number.replace(/\s/g, '');
      else if (field === 'expiry') value = selectedTestCard.expiry;
      else if (field === 'cvc') value = selectedTestCard.cvc;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value).then(() => {
          const orig = btn.textContent;
          btn.textContent = '✓';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = orig;
            btn.classList.remove('copied');
          }, 1300);
        }).catch(() => {});
      }
    };
  });
}

function updateTestCardHelper() {
  const c = selectedTestCard;
  if (!c) return;
  const lbl = $('tchLabel');
  const num = $('tchNumber');
  const exp = $('tchExpiry');
  const cvc = $('tchCvc');
  const note = $('tchNote');
  if (lbl) lbl.textContent = `${c.icon} ${c.label}`;
  if (num) num.textContent = c.number;
  if (exp) exp.textContent = c.expiry;
  if (cvc) cvc.textContent = c.cvc;
  if (note) {
    if (c.note) {
      note.textContent = c.note;
      note.classList.remove('hidden');
    } else {
      note.classList.add('hidden');
    }
  }
  document.querySelectorAll('#testCardList li').forEach((li, i) => {
    li.classList.toggle('tc-active', TEST_CARDS[i] === c);
  });
}

function setupPaymentPresets() {
  const grid = $('presetGrid');
  if (!grid) return;
  grid.innerHTML = '';
  TEST_CARDS.forEach((card, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-btn';
    btn.dataset.cardIndex = String(index);
    btn.innerHTML = `${card.icon} ${card.label}<small>${card.number} · ${card.expiry} · ${card.cvc}${card.note ? ` · ${card.note}` : ''}</small>`;
    grid.appendChild(btn);
  });

  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = TEST_CARDS[Number(btn.dataset.cardIndex)];
      if (!card) return;
      selectedTestCard = card;
      document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      updateTestCardHelper();
      copyText(card.number.replace(/\s/g, ''), `已复制：${card.number}`);
    });
  });
}

function tooltipHtml(key) {
  const hint = HINTS[key];
  const extra = HINT_EXTRA[key];
  if (!hint || !hint[lang]) return '';
  const heads =
    lang === 'zh'
      ? { desc: '说明', fe: '前端 SDK', be: '后端字段' }
      : { desc: 'What it does', fe: 'Frontend SDK', be: 'Backend field' };
  const sec = (title, body) =>
    body ? `<div class="tip-sec"><div class="tip-h">${title}</div><div class="tip-b">${escHtml(body)}</div></div>` : '';
  return (
    sec(heads.desc, hint[lang].l) +
    sec(heads.fe, extra && extra.fe && extra.fe[lang]) +
    sec(heads.be, extra && extra.be && extra.be[lang])
  );
}

function setupEli5Tooltips() {
  const tooltip = $('eli5Tooltip');
  if (!tooltip) return;
  document.querySelectorAll('.eli5').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const key = el.getAttribute('data-hint');
      const html = tooltipHtml(key);
      if (html) tooltip.innerHTML = html;
      else tooltip.textContent = el.textContent;
      tooltip.classList.remove('hidden');
    });
    el.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${Math.min(e.clientX + 14, window.innerWidth - 360)}px`;
      tooltip.style.top = `${e.clientY + 14}px`;
    });
    el.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
  });
}

/* ---------- country widget ---------- */
function setupCountryWidget() {
  const mainSel = $('country');
  mainSel.innerHTML = '';
  COUNTRIES.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = `${c.flag}  ${c.code} – ${c.name}`;
    mainSel.appendChild(opt);
  });
  mainSel.value = COUNTRIES[0].code;

  const cwSel = $('cwSelect');
  COUNTRIES.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = `${c.flag}  ${c.name}`;
    cwSel.appendChild(opt);
  });
  cwSel.value = mainSel.value;

  cwSel.addEventListener('change', () => {
    mainSel.value = cwSel.value;
    build();
  });
  mainSel.addEventListener('change', () => {
    cwSel.value = mainSel.value;
  });
}

/* ---------- init ---------- */
async function init() {
  // setupCountryWidget(); // Removed
  setupResizer();
  applyI18n();
  updateCart();

  const res = await fetch('/api/config');
  appConfig = await res.json();
  $('envBadge').textContent = appConfig.environment;
  if (!appConfig.configured) {
    $('credWarning').classList.remove('hidden');
    $('credMissingList').textContent = (appConfig.missing || []).join(', ');
  }

  $('applyBtn').addEventListener('click', build);
  ['amount', 'currency'].forEach((id) => {
    $(id).addEventListener('input', () => {
      updateCart();
      scheduleBuild(600);
    });
  });
  setupPaymentPresets();
  setupEli5Tooltips();
  $('langToggle').addEventListener('click', () => {
    lang = lang === 'zh' ? 'en' : 'zh';
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    applyI18n();
  });
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  document.querySelectorAll('input[name="component"]').forEach(radio => {
    radio.addEventListener('change', e => {
      $('componentTypeWrap').classList.toggle('hidden', e.target.value !== 'component');
      scheduleBuild();
    });
  });
  document.querySelectorAll('input[name="flow"], .params-body input, .params-body select, #componentType').forEach((el) => {
    el.addEventListener('change', () => scheduleBuild());
  });

  const handled = await handleRedirect();
  if (!handled && appConfig.configured) build();
}

window.addEventListener('DOMContentLoaded', init);
