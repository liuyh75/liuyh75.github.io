# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com/) 并注册/登录账号
2. 点击 "New Project" 创建一个新项目
3. 填写项目信息：
   - Project Name: 收益统计软件
   - Database Password: 设置一个安全的密码
   - Region: 选择离你最近的地区（如 Singapore）
4. 点击 "Create Project" 按钮，等待项目创建完成

## 2. 获取项目配置信息

1. 项目创建完成后，进入项目 dashboard
2. 点击左侧导航栏的 "Settings" → "API"
3. 复制以下信息：
   - Project URL (SUPABASE_URL)
   - Anon Public Key (SUPABASE_ANON_KEY)
4. 打开 `script.js` 文件，将这些值替换到相应的变量中：
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

## 3. 创建数据表

### 3.1 创建 `income_records` 表

1. 在项目 dashboard 中，点击左侧导航栏的 "Database" → "Tables"
2. 点击 "New Table" 按钮
3. 填写表信息：
   - Table name: `income_records`
   - Enable Row Level Security (RLS): 开启
4. 添加以下列：
   - `id` (type: `int8`, default: `gen_random_uuid()`, primary key)
   - `user_id` (type: `text`, required)
   - `date` (type: `date`, required)
   - `amount` (type: `float8`, required)
   - `channel` (type: `text`, required)
   - `note` (type: `text`)
   - `created_at` (type: `timestampz`, default: `now()`)
5. 点击 "Save" 按钮

### 3.2 创建 `investment_records` 表

1. 同样的方法，创建 `investment_records` 表
2. 填写表信息：
   - Table name: `investment_records`
   - Enable Row Level Security (RLS): 开启
3. 添加以下列：
   - `id` (type: `int8`, default: `gen_random_uuid()`, primary key)
   - `user_id` (type: `text`, required)
   - `date` (type: `date`, required)
   - `channel` (type: `text`, required)
   - `amount` (type: `float8`, required)
   - `newTotal` (type: `float8`, required)
   - `created_at` (type: `timestampz`, default: `now()`)
4. 点击 "Save" 按钮

## 4. 设置 Row Level Security (RLS) 规则

### 4.1 为 `income_records` 表设置 RLS 规则

1. 进入 `income_records` 表的设置页面
2. 点击 "Policies" 标签
3. 点击 "New Policy" 按钮
4. 选择 "For full access" → "Use policy template"
5. 填写策略信息：
   - Policy name: `User can access own records`
   - With check expression: `auth.uid()::text = user_id`
   - Using expression: `auth.uid()::text = user_id`
6. 点击 "Save Policy" 按钮

### 4.2 为 `investment_records` 表设置 RLS 规则

1. 同样的方法，为 `investment_records` 表设置 RLS 规则
2. 选择 "For full access" → "Use policy template"
3. 填写策略信息：
   - Policy name: `User can access own records`
   - With check expression: `auth.uid()::text = user_id`
   - Using expression: `auth.uid()::text = user_id`
4. 点击 "Save Policy" 按钮

## 5. 启用 Email 认证

1. 在项目 dashboard 中，点击左侧导航栏的 "Authentication" → "Settings"
2. 在 "Email Provider" 部分，点击 "Enable Email Provider"
3. 填写以下信息：
   - Site URL: 你的 GitHub Pages 访问链接
   - Redirect URLs: 你的 GitHub Pages 访问链接
   - SMTP Settings: 可以使用默认设置（Supabase 提供的 SMTP 服务）
4. 点击 "Save" 按钮

## 6. 部署到 GitHub Pages

1. 将修改后的所有文件上传到 GitHub 仓库
2. 在 GitHub 仓库的 "Settings" 中，找到 "Pages" 选项
3. 在 "Source" 下拉菜单中选择 "main" 分支，然后点击 "Save"
4. 等待几分钟后，GitHub 会生成一个访问链接
5. 将这个链接添加到 Supabase 的 "Site URL" 和 "Redirect URLs" 中

## 7. 测试多设备数据同步功能

1. 在电脑上打开 GitHub Pages 访问链接
2. 注册一个账号并添加一些收益记录
3. 在手机或其他电脑上打开同一个链接
4. 使用相同的账号登录
5. 检查是否能看到之前添加的收益记录
6. 在新设备上添加一些收益记录
7. 回到第一个设备，刷新页面，检查是否能看到新添加的收益记录

## 注意事项

- 确保开启了 Row Level Security (RLS)，以保护用户数据安全
- 确保设置了正确的 RLS 规则，只允许用户访问自己的数据
- 确保添加了正确的 Redirect URLs，否则登录后可能会出现错误
- 如果遇到问题，可以查看 Supabase 的官方文档或社区论坛寻求帮助
