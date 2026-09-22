# 个人工作台

一个面向个人的日常生活+工作一体化管理工具，移动端优先的单页应用。

## 功能模块

### 首页仪表盘
- 实时天气 + 穿衣/带伞建议
- 每日励志语句
- 通勤提醒（距上班时间 + 建议出门）
- 今日概览（待办/开支/打卡）
- 即将到期提醒
- 今日任务列表
- 习惯打卡
- 未来7天支出预告

### 任务与日程
- 任务分组（工作/个人/本周）
- 优先级（高/中/低）
- 子任务
- 习惯打卡
- 本周日程周视图
- 日期切换

### 提醒中心
- 8类提醒：生日纪念、订阅续费、车辆保险、账单还款、人情往来、证件到期、健康医药、其他
- 重复规则（不重复/每月/每年）
- 倒计时显示
- 分类筛选

### 财务
**开支记录**
- 本月总支出 + 预算进度
- 分类统计（油费/订阅/其他）
- 订阅管理（年成本汇总）
- 车辆支出汇总
- 开支流水
- 快速记账

**我的资产（理财）**
- 总资产概览 + 昨日涨跌
- 收益统计（累计/本月/今年收益率）
- 资产分布环形图
- 持仓明细（基金/理财/股票/存款/现金）
- 基金净值自动刷新（天天基金接口，点击刷新按钮）
- 绿涨红跌显示

### 我的
- 个人信息 + 数据概览
- 生活工具箱（10个工具）
  - 快速便签
  - 购物清单
  - 倒数日
  - 出门清单
  - 想看清单
  - 人情往来
  - 密码备忘（Base64加密存储）
  - 快递追踪
  - 报销记录
  - 健康提醒
- 数据看板（ECharts图表）
  - 支出趋势折线图
  - 支出分类占比饼图
  - 订阅年度成本柱状图
  - 任务完成率柱状图
  - 习惯坚持天数
- 设置（偏好/通勤/天气/数据管理）

## 技术栈

- Vue 3 + Vite
- Vue Router 4（Hash路由）
- Pinia（状态管理）
- Vant 4（移动端UI组件库）
- ECharts 5（数据可视化）
- Axios（HTTP请求）
- localStorage（数据持久化）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

启动后访问 http://localhost:5173

## 数据存储

所有数据存储在浏览器 localStorage 中，key 前缀为 `pw_`。

支持数据导出（JSON备份）和导入恢复。

## 第三方API

### 天气
- 默认使用模拟数据
- 可在设置中填入和风天气 API Key 获取真实天气
- 申请地址：https://dev.qweather.com/

### 基金净值
- 使用天天基金公开接口：`https://fundgz.1234567.com.cn/js/{基金代码}.js`
- JSONP 方式调用，无需 API Key
- 仅支持基金类资产自动刷新，其他类型需手动更新

### 每日一句
- 内置50条励志语录，每天随机一条
- 可手动刷新换一条

## 项目结构

```
db_workbench/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.js
    ├── App.vue
    ├── router/
    │   └── index.js
    ├── stores/
    │   ├── settings.js
    │   ├── tasks.js
    │   ├── reminders.js
    │   ├── expenses.js
    │   ├── assets.js
    │   └── habits.js
    ├── utils/
    │   ├── storage.js
    │   ├── date.js
    │   ├── weather.js
    │   ├── fund.js
    │   └── quote.js
    ├── components/
    │   ├── TabBar.vue
    │   ├── QuickAdd.vue
    │   ├── WeatherCard.vue
    │   ├── CommuteBar.vue
    │   ├── DailyQuote.vue
    │   ├── TaskItem.vue
    │   ├── ReminderItem.vue
    │   ├── ExpenseItem.vue
    │   ├── AssetItem.vue
    │   ├── HabitChecker.vue
    │   └── EmptyState.vue
    ├── views/
    │   ├── Home.vue
    │   ├── Tasks.vue
    │   ├── Reminders.vue
    │   ├── Finance.vue
    │   ├── Profile.vue
    │   ├── Dashboard.vue
    │   ├── Settings.vue
    │   ├── finance/
    │   │   ├── ExpenseTab.vue
    │   │   └── AssetTab.vue
    │   └── tools/
    │       ├── Notes.vue
    │       ├── Shopping.vue
    │       ├── Countdown.vue
    │       ├── Checklist.vue
    │       ├── Watchlist.vue
    │       ├── Gifts.vue
    │       ├── Passwords.vue
    │       ├── Express.vue
    │       ├── Reimburse.vue
    │       └── Health.vue
    └── assets/
        └── styles/
            └── global.css
```

## 注意事项

1. 基金净值接口为天天基金公开估算接口，盘中为估算值，收盘后为最新净值
2. 天气API需自行申请和风天气Key，不填则使用模拟数据
3. 密码备忘使用Base64简单编码，非强加密，请勿存储过于敏感的密码
4. 所有数据存在浏览器本地，清除浏览器数据会丢失，请定期导出备份
5. 移动端优先设计，建议在手机浏览器中使用，可"添加到主屏幕"当APP用
