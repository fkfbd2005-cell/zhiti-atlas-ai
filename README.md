# 基于 Three.js 与 BodyParts3D 的交互式三维人体解剖学习平台

「知体 · ATLAS AI」是一套中文三维人体解剖学习应用。项目以 Three.js 渲染 BodyParts3D 解剖网格，在浏览器中提供结构检索、自由点选、局部拆解、课程引导、知识测验、模型定位训练，以及受安全边界约束的 AI 教学助手。

仅供解剖学教育参考，不能用来诊断、治疗或替代教材。

## 运行

需要 Node.js 22.13 及以上。

双击 `启动知体.bat`，或者命令行：

```powershell
npm ci
npm run build
npm start
```

启动后打开 http://localhost:3017。

macOS 和 Linux 用 `start-zhiti.sh`，或者 `npm run launch`。

脚本会检查 Node 版本和端口，装依赖，构建，启动，开浏览器。已经装过、构建过的会跳过。

几个参数：

```powershell
node scripts/launch.mjs --port 3020
node scripts/launch.mjs --no-open
node scripts/launch.mjs --check-only
node scripts/launch.mjs --force-build
```

## 开发

```powershell
npm ci
npm run dev
```

地址 http://localhost:3016。开发模式同时起网页和本地 API。没有 `.env` 或密钥时走演示模式，用的是规则引擎，不是实时模型。三维视图、课程、题库都能用。

## 实现原理与架构

- **三维表现层**：React 负责界面状态，Three.js 负责模型加载、实例化渲染、射线点选、相机过渡、系统透明度与局部拆解动画。
- **解剖数据层**：BodyParts3D 网格经离线优化后按块加载；FMA 概念 ID 将 2,234 个可选网格组织为可检索、可验证的命名结构。
- **教学内容层**：课程、题库、模型定位训练与来源信息均为结构化数据，由统一动作协议驱动三维场景变化。
- **AI 交互层**：用户可在当前浏览器会话中配置兼容 OpenAI 格式的服务。系统提示词、主题校验和动作白名单共同限定其为解剖学教学助手；未配置或连接失败时自动使用离线演示能力。
- **静态部署**：GitHub Actions 构建 Vite 应用并发布至 GitHub Pages。静态版本的用户密钥由浏览器直接发送至所选 API 服务商，是否可用取决于服务商的 CORS 策略。

## 功能

- 2234 个可选网格，3432 个命名结构。支持旋转、缩放、点选、按系统筛选、拆解、聚焦、复位。
- 搜索支持中文、英文和 FMA ID。
- 三门课程，共 18 步：循环、呼吸、骨骼。
- 课内测验 18 道，每门 6 道，有模型点选题和即时反馈。
- 知识题库 100 道选择题，覆盖 10 个系统，分三档难度，带解析和 OpenStax 来源。
- 模型定位训练 50 道，可按系统筛选、随机组卷、重练错题。判分依据是结构 ID 和网格的对应关系。
- 助手预设 14 条以上意图。问不到的问题会直说规则边界在哪。
- 实时 AI 需要端侧配置密钥，返回的动作会经过服务端和浏览器两次校验。

## 配置实时 AI

复制 `.env.example` 为 `.env`：

```text
AI_MODE=live
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-flash
AI_API_KEY=你的密钥
```

密钥只放服务端，不要写进 `VITE_` 开头的变量。界面上也能临时配置，只存在当前会话，不落盘。

`npm run verify:live` 会发一次真实请求，会计费。

## 测试

```powershell
npm run check
node scripts/validate-atlas.mjs
node scripts/validate-interactions.mjs
npm test
npm run build
npm run test:e2e
```

## 来源

- 上游应用代码：[ashemag/human-atlas](https://github.com/ashemag/human-atlas)，MIT 协议，基线 commit `1c38bf35c254a891200d3cedecfd57abebe83d8d`。
- 人体数据是 BodyParts3D 4.0，数据库中心 DBCLS 出品，CC BY 4.0。
- 课程内容参考 OpenStax Anatomy & Physiology 2e，中文部分是重写的，医学表述还没经过专业审核。
- 完整署名见 `LICENSE`、`public/ATTRIBUTION.md`、`THIRD_PARTY_NOTICES.md`。

## 已知情况

模型是成年男性参考解剖，不涵盖所有个体差异。命名结构和独立网格不是一回事，肺泡这类微观结构只有文字讲解。没有做过医学专家终审、真实学生试用、低端手机性能测试和公网部署。
