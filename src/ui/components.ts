type ElOptions = {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
};

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, options: ElOptions = {}): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) element.setAttribute(key, value);
  }
  return element;
}

export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  return element;
}

export function clearChildren(container: Element): void {
  container.innerHTML = "";
}
