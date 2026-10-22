import { defineComponent, Fragment, h } from "vue";
import { renderPreviewScene } from "../scenes/renderScene.js";
import { useStudio } from "../composables/useStudio.js";

// 把已有 CSS 场景转成 Vue 节点：更新属性时保留角色 DOM，CSS 位移动画可连续播放。
function toVNode(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return null;
  const attributes = Object.fromEntries(
    [...node.attributes].map(({ name, value }) => [name, value]),
  );
  return h(
    node.tagName.toLowerCase(),
    attributes,
    [...node.childNodes].map(toVNode).filter((child) => child !== null),
  );
}

export default defineComponent({
  props: {
    mission: { type: Object, required: true },
    label: { type: String, default: "作品预览" },
  },
  setup(props) {
    const studio = useStudio();
    return () => {
      const template = document.createElement("template");
      template.innerHTML = renderPreviewScene(
        props.mission,
        props.label,
        studio,
      );
      return h(Fragment, [...template.content.childNodes].map(toVNode));
    };
  },
});
