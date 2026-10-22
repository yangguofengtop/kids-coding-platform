import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import App from "../src/App.vue";
import PreviewScene from "../src/components/PreviewScene.vue";
import { createStudio } from "../src/composables/createStudio.js";
import { studioKey } from "../src/composables/useStudio.js";
import { STORAGE_KEY } from "../src/data/catalog.js";

let wrapper;
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  wrapper?.unmount();
  vi.useRealTimers();
});

describe("Vue 3 页面交互", () => {
  it("切换难度、推荐任务和主题进度", async () => {
    wrapper = mount(App);
    await wrapper.get('[data-age="young"]').trigger("click");
    expect(wrapper.get("h1").text()).toBe("今天去哪里玩？");
    expect(wrapper.get(".continue-panel").text()).toContain("小猫找朋友");
    const previous = wrapper.get(".task-list").text();
    await wrapper.get('[data-action="shuffle"]').trigger("click");
    expect(wrapper.get(".task-list").text()).not.toBe(previous);
    await wrapper.get('[data-action="show-progress"]').trigger("click");
    expect(wrapper.find(".topic-progress").exists()).toBe(true);
  });
  it("自由作品重命名保留输入焦点，保存后可继续创作", async () => {
    wrapper = mount(App, { attachTo: document.body });
    await wrapper.get('[data-view="create"]').trigger("click");
    await wrapper.get('[data-template="story"]').trigger("click");
    const input = wrapper.get("#free-title");
    input.element.focus();
    await input.setValue("我的小猫故事");
    expect(document.activeElement).toBe(input.element);
    expect(wrapper.get("h1").text()).toBe("我的小猫故事");
    await wrapper.get('[data-add-block="move"]').trigger("click");
    await wrapper.get('.page-heading [data-view="works"]').trigger("click");
    expect(wrapper.text()).toContain("我的小猫故事");
    await wrapper.get("[data-free-project]").trigger("click");
    expect(wrapper.findAll(".program-block")).toHaveLength(2);
  });
  it("小猫运行完成后展示下一关，角色节点不被重建", async () => {
    wrapper = mount(App);
    await wrapper.get('[data-age="young"]').trigger("click");
    await wrapper.get('[data-action="continue"]').trigger("click");
    await wrapper.get('[data-add-block="move"]').trigger("click");
    const actor = wrapper.get(".cat-hero").element;
    await wrapper
      .get('.workbench-actions [data-action="run"]')
      .trigger("click");
    await vi.advanceTimersByTimeAsync(400);
    expect(wrapper.get('.program-block.current-step').text()).toContain('当点击开始');
    await vi.advanceTimersByTimeAsync(700);
    expect(wrapper.get('.program-block.current-step').text()).toContain('走到朋友身边');
    await vi.advanceTimersByTimeAsync(900);
    expect(wrapper.get(".cat-hero").element).toBe(actor);
    expect(wrapper.get(".feedback-box").text()).toContain("任务完成");
    await wrapper.get('[data-next-mission="young-magic"]').trigger("click");
    expect(wrapper.get("h1").text()).toBe("魔法变色屋");
  });
  it("塔防执行发射时展示炮口、弹体和命中效果", async () => {
    wrapper = mount(App);
    await wrapper.get('[data-age="older"]').trigger("click");
    await wrapper.get('[data-action="continue"]').trigger("click");
    for (const type of ["variable", "repeat", "condition", "attack"])
      await wrapper.get(`[data-add-block="${type}"]`).trigger("click");
    await wrapper
      .get('.workbench-actions [data-action="run"]')
      .trigger("click");
    await vi.advanceTimersByTimeAsync(3200);
    expect(wrapper.find(".tower-shot.is-active").exists()).toBe(true);
    expect(wrapper.find(".tower-muzzle.is-firing").exists()).toBe(true);
    expect(wrapper.find(".tower-impact.is-active").exists()).toBe(true);
    expect(wrapper.get(".scene-energy strong").text()).toBe("79");
    await vi.advanceTimersByTimeAsync(1000);
    expect(wrapper.get(".feedback-box").text()).toContain("任务完成");
  });
  it("家长报告读取保存的数据且不显示已移除的按钮", () => {
    const studio = createStudio();
    studio.state.attempts = 7;
    studio.createFreeProject("story");
    studio.leaveFreeWorkbench("parent");
    studio.dispose();
    wrapper = mount(App);
    expect(wrapper.get(".metrics").text()).toContain("7 次");
    expect(wrapper.get(".metrics").text()).toContain("1 个");
    expect(wrapper.text()).not.toContain("查看亲子讨论建议");
  });
  it("星星从舞台外移动时保留节点，尚未变色和发声", async () => {
    const studio = createStudio();
    studio.state.view = "workbench";
    studio.state.ageMode = "young";
    studio.state.missionId = "young-beat";
    const mission = studio.currentMission();
    wrapper = mount(PreviewScene, {
      props: { mission, interactive: true },
      global: { provide: { [studioKey]: studio } },
    });
    const actor = wrapper.get(".star-singer").element;
    studio.state.runData = studio.createRunData(mission);
    studio.state.lastRun = "running";
    studio.applyExecutionStep({ type: "start" }, studio.state.runData, "young");
    await nextTick();
    expect(wrapper.get(".preview-stage").attributes("style")).toContain(
      "--actor-left: 17%",
    );
    studio.applyExecutionStep({ type: "move" }, studio.state.runData, "young");
    await nextTick();
    expect(wrapper.get(".star-singer").element).toBe(actor);
    expect(wrapper.get(".preview-stage").attributes("style")).toContain(
      "--actor-left: 57%",
    );
    expect(wrapper.get(".star-singer").classes()).not.toContain("is-bright");
    expect(wrapper.get(".star-singer").classes()).not.toContain("is-singing");
    studio.dispose();
  });
  it("从旧版 localStorage 恢复任务与完成结果", () => {
    const program = ["start", "move"].map((type) => ({ type }));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ageMode: "young",
        missionId: "young-cat",
        view: "workbench",
        program,
        programsByMission: { young: { "young-cat": program } },
        completedMissionsByMode: {
          young: ["young-cat"],
          middle: [],
          older: [],
        },
        lastRun: "success",
      }),
    );
    wrapper = mount(App);
    expect(wrapper.get("h1").text()).toBe("小猫找朋友");
    expect(wrapper.get(".feedback-box").text()).toContain("任务完成");
    expect(wrapper.findAll(".program-block")).toHaveLength(2);
  });
});
