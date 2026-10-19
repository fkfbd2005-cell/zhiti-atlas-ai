import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
const shots = "evidence/screenshots";
test.beforeAll(() => mkdirSync(shots, { recursive: true }));
test.beforeEach(async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem("zhiti-intro-seen", "1");
  });
  if (!testInfo.title.includes("用户可在会话中配置"))
    await page.addInitScript(() =>
      sessionStorage.setItem("zhiti-ai-prompted-v1", "1"),
    );
  await page.goto("/");
  await expect(page.getByText("正在装配人体模型", { exact: true })).toBeHidden({
    timeout: 45_000,
  });
});

test("桌面探索、课程、测验与来源闭环", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(
    page.getByRole("heading", { name: "从一个结构开始" }),
  ).toBeVisible();
  await expect(page.getByText("不猜测，不偷换")).toHaveCount(0);
  await page.getByRole("button", { name: "返回上一级或关闭学习面板" }).click();
  await expect(page.getByLabel("学习面板", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "自由探索", exact: true }).click();
  await expect(page.getByLabel("学习面板", { exact: true })).toBeVisible();
  await page.getByLabel("搜索结构").fill("不存在的器官");
  await expect(page.getByText("未找到可验证结构")).toBeVisible();
  await page.getByLabel("搜索结构").fill("");
  await page.getByLabel("搜索结构").fill("心脏");
  await page.getByRole("button", { name: /心脏 heart/ }).click();
  await page.waitForTimeout(2200);
  await expect(page.getByText("FMA7088", { exact: true })).toBeVisible();
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.67, box.y + box.height * 0.58, {
      steps: 8,
    });
    await page.mouse.up();
    await page.mouse.wheel(0, -240);
    await expect(canvas).toBeVisible();
  }
  await page.getByLabel("向导学助手提问").fill("展示呼吸系统");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText(/已显示呼吸系统并定位(左右肺|双肺)/)).toBeVisible();
  await page.getByRole("button", { name: "AI 导学" }).click();
  await expect(page.getByText("不是阅读，是跟着模型学")).toHaveCount(0);
  await page.getByRole("button", { name: /一滴血的双循环旅程/ }).click();
  await expect(
    page.getByRole("heading", { name: "先看循环全景" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(
    page.getByRole("heading", { name: "心脏：循环的动力泵" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "解剖测验" }).click();
  const leftVentricle = page.getByRole("button", {
    name: "左心室",
    exact: true,
  });
  await expect(leftVentricle).toBeVisible();
  await leftVentricle.click({ force: true });
  await expect(page.getByText("回答正确", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "关于与来源" }).click();
  await expect(page.getByText("真实边界，也是作品的一部分")).toHaveCount(0);
  await expect(page.getByText("Human Atlas × BodyParts3D 4.0")).toBeVisible();
});

test("手机和极窄屏可操作", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "打开结构控制" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "打开结构控制" }).click();
  await expect(page.getByLabel("搜索结构")).toBeVisible();
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${shots}/06-mobile-390.png` });
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(
    page.getByRole("button", { name: "打开学习面板" }),
  ).toBeVisible();
  await page.screenshot({ path: `${shots}/07-narrow-320.png` });
});

test("用户可在会话中配置、测试、使用并清除 AI", async ({ page }) => {
  test.setTimeout(180_000);
  let apiCalls = 0;
  await page.route("**/chat/completions", async (route) => {
    apiCalls++;
    const body = route.request().postDataJSON();
    const question = body.messages.at(-1)?.content ?? "";
    const content = question.includes("连接成功")
      ? { mode: "live", answer: "连接成功", actions: [], citations: [], limitations: [] }
      : { mode: "live", answer: "已定位心脏", actions: [{ type: "focus", conceptId: "FMA7088" }], citations: [], limitations: [] };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }) });
  });
  await page.getByLabel("向导学助手提问").click();
  await expect(page.getByRole("heading", { name: "连接你的 AI 服务" })).toBeVisible();
  await page.getByLabel("API Key").fill("session-only-test-key");
  await page.getByRole("button", { name: "测试连接" }).click();
  await expect(page.getByText(/连接成功，配置仅保存/)).toBeVisible();
  await page.getByRole("button", { name: "保存并启用" }).click();
  await page.getByLabel("向导学助手提问").fill("定位心脏");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText("已定位心脏", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "心脏" })).toBeVisible();
  const beforeRefusal = apiCalls;
  await page.getByLabel("向导学助手提问").fill("帮我写一首情诗");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText(/只能回答人体结构/)).toBeVisible();
  expect(apiCalls).toBe(beforeRefusal);
  await page.getByLabel("AI API 配置").click();
  await page.getByRole("button", { name: /清除配置/ }).click();
  await expect(page.getByLabel("AI API 配置")).toContainText("演示模式");
});

test("结构拆解保持部件表面清晰", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "结构拆解" }).click();
  await expect(page.getByRole("button", { name: "还原装配" })).toBeVisible();
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${shots}/15-explosion-clean.png` });
  await page.getByRole("button", { name: "还原装配" }).click();
  await page.waitForTimeout(1800);
  await page.getByLabel("搜索结构").fill("心脏");
  await page.getByRole("button", { name: /心脏 heart/ }).click();
  await expect(
    page.getByRole("button", { name: "拆解当前部位" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "拆解当前部位" }).click();
  await expect(page.getByRole("button", { name: "还原装配" })).toBeVisible();
  await page.waitForTimeout(1200);
  const localCanvas = page.locator("canvas");
  const localBox = await localCanvas.boundingBox();
  if (localBox) {
    await page.mouse.move(localBox.x + localBox.width * 0.5, localBox.y + localBox.height * 0.48);
    await page.mouse.down();
    await page.mouse.move(localBox.x + localBox.width * 0.62, localBox.y + localBox.height * 0.48, { steps: 6 });
    await page.mouse.up();
  }
  await expect(page.getByRole("button", { name: "还原装配" })).toBeVisible();
  await page.getByRole("button", { name: "还原装配" }).click();
  await expect(
    page.getByRole("button", { name: "拆解当前部位" }),
  ).toBeVisible();
});

test("模型定位训练不泄露答案、支持直达并在返回时复位", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "解剖测验" }).click();
  await page.getByRole("button", { name: /扩展到 100 题题库/ }).click();
  await page.getByRole("button", { name: /进入 50 道模型定位训练/ }).click();
  await expect(
    page.getByRole("heading", { name: "五十个真实结构" }),
  ).toBeVisible();
  await expect(page.getByText("50", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /心脏 heart/ }).click();
  await expect(
    page.getByRole("heading", { name: "请在三维模型中点选心脏。" }),
  ).toBeVisible();
  await expect(page.getByText("请直接点击中间三维模型")).toBeVisible();
  await expect(
    page.locator(".systems-list button[aria-pressed=true]"),
  ).toHaveCount(14);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/16-model-training-heart-ready.png` });
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (box)
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.245);
  await expect(page.getByText("定位正确", { exact: true })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator(".panel-actions .explode-hint")).toBeVisible();
  await expect(
    page.getByText("已平滑聚焦正确结构，周围部位保留为低透明度参照。"),
  ).toBeVisible();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${shots}/20-model-training-heart-focus.png` });
  await expect(page.getByText(/FMA7088 · 83 个映射网格/)).toBeVisible();
  await page.getByRole("button", { name: /题目列表/ }).click();
  await expect(
    page.locator(".systems-list button[aria-pressed=true]"),
  ).toHaveCount(14);
  await page.getByRole("button", { name: "骨骼系统", exact: true }).click();
  await page.getByRole("button", { name: /颅骨 skull/ }).click();
  await expect(
    page.getByRole("heading", { name: "请在三维模型中点选颅骨。" }),
  ).toBeVisible();
  await expect(page.getByText("请直接点击中间三维模型")).toBeVisible();
  await expect(
    page.locator(".systems-list button[aria-pressed=true]"),
  ).toHaveCount(14);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/17-model-training-skull-ready.png` });
  await page.getByRole("button", { name: /题目列表/ }).click();
  await page.getByRole("button", { name: "呼吸系统", exact: true }).click();
  await page.getByRole("button", { name: /右肺 right lung/ }).click();
  await expect(
    page.getByRole("heading", { name: "请在三维模型中点选右肺。" }),
  ).toBeVisible();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${shots}/18-model-training-lung-ready.png` });
  await page.getByRole("button", { name: /题目列表/ }).click();
  await page.getByRole("button", { name: "综合系统", exact: true }).click();
  await page.getByRole("button", { name: /肾 kidney/ }).click();
  await expect(
    page.getByRole("heading", { name: "请在三维模型中点选肾。" }),
  ).toBeVisible();
  await expect(
    page.locator(".systems-list button[aria-pressed=true]"),
  ).toHaveCount(14);
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: `${shots}/19-model-training-kidney-ready.png`,
  });
  await page.getByRole("button", { name: "知识题库" }).click();
  await expect(
    page.getByRole("heading", { name: "十个系统，一百道题" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "定位训练", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "五十个真实结构" }),
  ).toBeVisible();
});

test("镜头推进、比较、接管与减少动态效果", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: `${shots}/08-camera-full-body.png` });
  await page.getByRole("button", { name: /心脏 FMA7088/ }).click();
  await page.waitForTimeout(180);
  await page.screenshot({ path: `${shots}/09-camera-heart-context.png` });
  await page.waitForTimeout(620);
  await page.screenshot({ path: `${shots}/10-camera-heart-approach.png` });
  await page.waitForTimeout(950);
  await page.screenshot({ path: `${shots}/11-camera-heart-focus.png` });
  await page.getByLabel("向导学助手提问").fill("比较左右肺");
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.getByText(/左右肺纳入同一|左右肺.*观察构图/)).toBeVisible();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${shots}/12-camera-lung-compare.png` });
  await page.getByLabel("搜索结构").fill("股骨");
  await page.getByRole("button", { name: /股骨 femur/ }).click();
  await expect(page.getByRole("heading", { name: "股骨" })).toBeVisible();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${shots}/13-camera-femur-context.png` });
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.52, box.y + box.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, {
      steps: 4,
    });
    await page.mouse.up();
  }
  await page.getByLabel("复位模型").click();
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `${shots}/14-camera-restored.png` });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByLabel("搜索结构").fill("心脏");
  await page.getByRole("button", { name: /心脏 heart/ }).click();
  await expect(page.getByRole("heading", { name: "心脏" })).toBeVisible();
});
