import { inject } from "vue";

export const studioKey = Symbol("studio");

export function useStudio() {
  const studio = inject(studioKey);
  if (!studio) throw new Error("缺少编程工作室状态");
  return studio;
}
