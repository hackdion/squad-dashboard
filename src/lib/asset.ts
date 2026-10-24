/** 统一拼接 public 资源路径，兼容 GitHub Pages 子路径 */
export const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

export const portraitOf = (operatorId: string) => asset(`renders/${operatorId}.png`);
export const iconOf = (operatorId: string) => asset(`operators/${operatorId}.svg`);
