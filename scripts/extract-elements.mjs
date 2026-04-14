#!/usr/bin/env node
/**
 * Extract annotated element metadata from React prototype .tsx files.
 *
 * Usage:
 *   node prototype-runtime/scripts/extract-elements.mjs projects/Shift-Manager
 *
 * Reads prototype/pages/*.tsx + prototype/index.css from the project folder.
 * Writes one JSON file per page to blueprints/extracted/[PageName].json.
 *
 * Uses the TypeScript compiler API (already a devDependency of prototype-runtime)
 * to parse JSX/TSX into a proper AST — no regex hacks.
 */

import { createRequire } from "module";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "fs";
import { join, basename, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const runtimeRoot = resolve(__dirname, "..");

const require = createRequire(join(runtimeRoot, "package.json"));
const ts = require("typescript");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const projectPath = process.argv[2];
if (!projectPath) {
  console.error("Usage: node prototype-runtime/scripts/extract-elements.mjs <project-path>");
  console.error("  e.g. node prototype-runtime/scripts/extract-elements.mjs projects/Shift-Manager");
  process.exit(1);
}

const projectRoot = resolve(projectPath);
const pagesDir = join(projectRoot, "prototype", "pages");
const cssPath = join(projectRoot, "prototype", "index.css");
const outDir = join(projectRoot, "blueprints", "extracted");

if (!existsSync(pagesDir)) {
  console.error(`No pages directory at ${pagesDir}`);
  process.exit(1);
}
if (!existsSync(cssPath)) {
  console.error(`No index.css at ${cssPath}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Parse index.css into a token map
// ---------------------------------------------------------------------------

function parseTokenMap(css) {
  const tokens = {};

  // Parse @theme { } block — Tailwind v4 design tokens
  const themeMatch = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (themeMatch) {
    for (const m of themeMatch[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[m[1].trim()] = m[2].trim();
    }
  }

  // Parse :root { } block — spacing, shadows, etc.
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (rootMatch) {
    for (const m of rootMatch[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[m[1].trim()] = m[2].trim();
    }
  }

  // Parse CSS class rules (.t-display, .card-shadow, etc.)
  const classRules = {};
  const classRegex = /\.([\w-]+)\s*\{([^}]+)\}/g;
  for (const m of css.matchAll(classRegex)) {
    const name = m[1];
    const props = {};
    for (const p of m[2].matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) {
      let val = p[2].trim();
      // Resolve var() references in class rules
      val = resolveVars(val, tokens);
      props[p[1].trim()] = val;
    }
    classRules[name] = props;
  }

  return { tokens, classRules };
}

function resolveVars(value, tokens) {
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => tokens[name] || `var(${name})`);
}

// ---------------------------------------------------------------------------
// 2. Tailwind class resolution helpers
// ---------------------------------------------------------------------------

function resolveTailwindColor(cls, tokens) {
  // bg-card -> --color-card, text-foreground -> --color-foreground, etc.
  const prefixes = [
    { tw: "bg-", css: "--color-" },
    { tw: "text-", css: "--color-" },
    { tw: "border-", css: "--color-" },
  ];

  for (const { tw, css } of prefixes) {
    if (cls.startsWith(tw)) {
      const rest = cls.slice(tw.length);
      // Handle opacity modifiers: bg-primary/[0.09]
      const opacityMatch = rest.match(/^(.+?)\/\[?([\d.]+)]?$/);
      const tokenName = opacityMatch ? opacityMatch[1] : rest;
      const tokenKey = css + tokenName;
      const value = tokens[tokenKey];
      if (value) {
        if (opacityMatch) {
          return { property: tw.replace("-", ""), token: cls, resolved: `${value} at ${opacityMatch[2]} opacity` };
        }
        return { property: tw.replace("-", ""), token: cls, resolved: value };
      }
    }
  }
  return null;
}

function resolveExplicitSize(cls) {
  // text-[36px], rounded-[6px], w-[420px], etc.
  const m = cls.match(/^[\w-]+-\[(\d+(?:\.\d+)?(?:px|rem|em|%))\]$/);
  if (m) return m[1];
  return null;
}

function resolveRadiusToken(cls, tokens) {
  // rounded-[var(--radius-lg)] -> 6px
  const m = cls.match(/^rounded-\[var\((--[\w-]+)\)\]$/);
  if (m) return tokens[m[1]] || null;
  return null;
}

function resolveWidthFraction(cls) {
  const fractions = {
    "w-full": 1.0, "w-1/2": 0.5, "w-1/3": 0.333, "w-2/3": 0.667,
    "w-1/4": 0.25, "w-3/4": 0.75, "w-1/5": 0.2, "w-2/5": 0.4,
    "w-3/5": 0.6, "w-4/5": 0.8,
  };
  return fractions[cls] ?? null;
}

function resolveFlexFraction(cls) {
  const m = cls.match(/^flex-\[(\d+)\]$/);
  if (m) return parseInt(m[1]);
  if (cls === "flex-1") return 1;
  return null;
}

// ---------------------------------------------------------------------------
// 3. AST walking utilities
// ---------------------------------------------------------------------------

function getJsxAttributeValue(node, attrName) {
  if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return null;
  for (const attr of node.attributes.properties) {
    if (ts.isJsxAttribute(attr) && attr.name.getText() === attrName) {
      if (!attr.initializer) return "true";
      if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
      if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
        return extractExpressionText(attr.initializer.expression);
      }
    }
  }
  return null;
}

function extractExpressionText(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) return node.getText();
  return node.getText();
}

function getClassName(openingElement) {
  return getJsxAttributeValue(openingElement, "className") || "";
}

function getInlineStyles(openingElement, tokens) {
  for (const attr of openingElement.attributes.properties) {
    if (ts.isJsxAttribute(attr) && attr.name.getText() === "style") {
      if (attr.initializer && ts.isJsxExpression(attr.initializer)) {
        const expr = attr.initializer.expression;
        if (expr && ts.isObjectLiteralExpression(expr)) {
          return extractStyleObject(expr, tokens);
        }
      }
    }
  }
  return {};
}

function extractStyleObject(objLiteral, tokens) {
  const styles = {};
  for (const prop of objLiteral.properties) {
    if (ts.isPropertyAssignment(prop)) {
      const key = prop.name.getText();
      let val = "";
      if (ts.isStringLiteral(prop.initializer)) {
        val = prop.initializer.text;
      } else if (ts.isNumericLiteral(prop.initializer)) {
        val = prop.initializer.text + "px";
      } else {
        val = prop.initializer.getText();
      }
      styles[camelToKebab(key)] = resolveVars(val, tokens);
    }
  }
  return styles;
}

function camelToKebab(s) {
  return s.replace(/([A-Z])/g, "-$1").toLowerCase();
}

// ---------------------------------------------------------------------------
// 4. Resolve wrapper styles from className + inline styles
// ---------------------------------------------------------------------------

function resolveWrapperStyles(className, inlineStyles, tokenMap) {
  const { tokens, classRules } = tokenMap;
  const resolved = {};
  const classes = splitClasses(className);

  for (const cls of classes) {
    // Token-based colors
    const color = resolveTailwindColor(cls, tokens);
    if (color) {
      if (cls.startsWith("bg-")) resolved.background = color.resolved;
      else if (cls.startsWith("border-") && !cls.includes("collapse")) resolved.border_color = color.resolved;
      continue;
    }

    // Radius from token: rounded-[var(--radius-lg)]
    const radiusVal = resolveRadiusToken(cls, tokens);
    if (radiusVal) { resolved.border_radius = radiusVal; continue; }

    // Explicit sizes: rounded-[6px], etc.
    if (cls.startsWith("rounded")) {
      const sz = resolveExplicitSize(cls);
      if (sz) resolved.border_radius = sz;
      continue;
    }

    // Shadow classes
    if (cls === "card-shadow" && classRules["card-shadow"]) {
      resolved.box_shadow = classRules["card-shadow"]["box-shadow"] || "standard";
    }
    if (cls === "card-shadow-elevated" && classRules["card-shadow-elevated"]) {
      resolved.box_shadow = classRules["card-shadow-elevated"]["box-shadow"] || "elevated";
    }

    // Border presence
    if (cls === "border") resolved.has_border = true;
  }

  // Merge inline styles (already var-resolved)
  for (const [k, v] of Object.entries(inlineStyles)) {
    resolved[k] = v;
  }

  return resolved;
}

function splitClasses(className) {
  if (!className) return [];
  // Handle cn() calls — extract string literals
  if (className.includes("cn(")) {
    const strings = [];
    for (const m of className.matchAll(/"([^"]+)"|'([^']+)'/g)) {
      strings.push(m[1] || m[2]);
    }
    return strings.flatMap(s => s.split(/\s+/).filter(Boolean));
  }
  return className.split(/\s+/).filter(Boolean);
}

// ---------------------------------------------------------------------------
// 5. Extract shallow children info
// ---------------------------------------------------------------------------

function extractChildren(jsxElement, tokenMap, sourceFile, depth = 0) {
  if (depth > 1) return [];
  const children = [];

  function walkChildren(node) {
    if (ts.isJsxElement(node)) {
      const opening = node.openingElement;
      const tagName = opening.tagName.getText();
      const cls = getClassName(opening);
      const inlineStyles = getInlineStyles(opening, tokenMap.tokens);
      const staticText = extractStaticText(node);
      const typeScale = extractTypeScaleInfo(cls, tokenMap.classRules);

      const child = {
        tag: tagName,
        classes: cls,
      };
      if (Object.keys(inlineStyles).length > 0) child.inline_styles = inlineStyles;
      if (staticText) child.text = staticText;
      if (typeScale) child.type_scale = typeScale;

      // Detect Recharts components
      if (isRechartsComponent(tagName)) {
        child.recharts = extractRechartsProps(opening);
      }

      // Recurse one more level
      if (depth < 1) {
        const nested = extractChildren(node, tokenMap, sourceFile, depth + 1);
        if (nested.length > 0) child.children = nested;
      }

      children.push(child);
    } else if (ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText();
      const cls = getClassName(node);
      const child = { tag: tagName, classes: cls };

      if (isRechartsComponent(tagName)) {
        child.recharts = extractRechartsProps(node);
      }

      const inlineStyles = getInlineStyles(node, tokenMap.tokens);
      if (Object.keys(inlineStyles).length > 0) child.inline_styles = inlineStyles;

      children.push(child);
    } else if (ts.isJsxFragment(node) || ts.isParenthesizedExpression(node)) {
      ts.forEachChild(node, walkChildren);
    } else if (ts.isJsxExpression(node) && node.expression) {
      ts.forEachChild(node, walkChildren);
    }
  }

  if (ts.isJsxElement(jsxElement)) {
    for (const child of jsxElement.children) {
      walkChildren(child);
    }
  }

  return children;
}

function extractStaticText(jsxElement) {
  const texts = [];
  for (const child of jsxElement.children) {
    if (ts.isJsxText(child)) {
      const t = child.text.trim();
      if (t) texts.push(t);
    }
  }
  return texts.length > 0 ? texts.join(" ") : null;
}

function extractTypeScaleInfo(className, classRules) {
  const classes = splitClasses(className);
  for (const cls of classes) {
    if (cls.startsWith("t-") && classRules[cls]) {
      return { class: cls, ...classRules[cls] };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 6. Recharts detection
// ---------------------------------------------------------------------------

const RECHARTS_CONTAINERS = new Set([
  "BarChart", "LineChart", "AreaChart", "ComposedChart", "PieChart",
  "RadarChart", "ScatterChart", "FunnelChart", "Treemap", "RadialBarChart",
]);

const RECHARTS_SERIES = new Set([
  "Bar", "Line", "Area", "Scatter", "Pie", "Radar", "Funnel", "RadialBar",
]);

const RECHARTS_COMPONENTS = new Set([
  ...RECHARTS_CONTAINERS, ...RECHARTS_SERIES,
  "XAxis", "YAxis", "CartesianGrid", "Tooltip", "Legend",
  "ReferenceLine", "ReferenceDot", "ReferenceArea",
  "ResponsiveContainer", "Cell", "LabelList",
]);

function isRechartsComponent(tagName) {
  return RECHARTS_COMPONENTS.has(tagName);
}

function extractRechartsProps(openingOrSelfClosing) {
  const props = {};
  for (const attr of openingOrSelfClosing.attributes.properties) {
    if (ts.isJsxAttribute(attr)) {
      const name = attr.name.getText();
      if (!attr.initializer) {
        props[name] = true;
      } else if (ts.isStringLiteral(attr.initializer)) {
        props[name] = attr.initializer.text;
      } else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
        const expr = attr.initializer.expression;
        if (ts.isNumericLiteral(expr)) props[name] = Number(expr.text);
        else if (ts.isStringLiteral(expr)) props[name] = expr.text;
        else if (expr.kind === ts.SyntaxKind.TrueKeyword) props[name] = true;
        else if (expr.kind === ts.SyntaxKind.FalseKeyword) props[name] = false;
        else if (ts.isArrayLiteralExpression(expr)) {
          props[name] = expr.elements.map(e => ts.isNumericLiteral(e) ? Number(e.text) : e.getText());
        }
        else props[name] = `{${expr.getText()}}`;
      }
    }
  }
  return props;
}

function extractChartInfo(jsxElement) {
  const chart = { type: null, series: [], axes: {}, features: {} };

  function walk(node) {
    let tagName, opening;
    if (ts.isJsxElement(node)) {
      opening = node.openingElement;
      tagName = opening.tagName.getText();
    } else if (ts.isJsxSelfClosingElement(node)) {
      opening = node;
      tagName = node.tagName.getText();
    } else {
      ts.forEachChild(node, walk);
      return;
    }

    if (RECHARTS_CONTAINERS.has(tagName)) {
      chart.type = tagName;
    }

    if (RECHARTS_SERIES.has(tagName)) {
      const seriesProps = extractRechartsProps(opening);
      chart.series.push({ component: tagName, ...seriesProps });
    }

    if (tagName === "XAxis") {
      chart.axes.x = extractRechartsProps(opening);
    }
    if (tagName === "YAxis") {
      chart.axes.y = extractRechartsProps(opening);
    }
    if (tagName === "CartesianGrid") {
      chart.features.grid = extractRechartsProps(opening);
    }
    if (tagName === "Tooltip") {
      chart.features.tooltip = true;
    }
    if (tagName === "Legend") {
      chart.features.legend = extractRechartsProps(opening);
    }
    if (tagName === "ReferenceLine") {
      chart.features.reference_line = extractRechartsProps(opening);
    }

    ts.forEachChild(node, walk);
  }

  walk(jsxElement);
  return chart.type ? chart : null;
}

// ---------------------------------------------------------------------------
// 7. Table detection
// ---------------------------------------------------------------------------

function extractTableInfo(jsxElement, tokenMap) {
  const info = { has_table: false };

  function walk(node) {
    let tagName, opening;
    if (ts.isJsxElement(node)) {
      opening = node.openingElement;
      tagName = opening.tagName.getText();
    } else if (ts.isJsxSelfClosingElement(node)) {
      tagName = node.tagName.getText();
      opening = node;
    } else {
      ts.forEachChild(node, walk);
      return;
    }

    if (tagName === "table") {
      info.has_table = true;
      const cls = getClassName(opening);
      if (cls) info.table_classes = cls;
      const styles = getInlineStyles(opening, tokenMap.tokens);
      if (Object.keys(styles).length > 0) info.table_styles = styles;
    }
    if (tagName === "thead") {
      info.has_thead = true;
    }
    if (tagName === "tbody") {
      info.has_tbody = true;
    }
    if (tagName === "th") {
      const cls = getClassName(opening);
      if (cls) info.th_classes = cls;
      const typeScale = extractTypeScaleInfo(cls, tokenMap.classRules);
      if (typeScale) info.th_text_style = typeScale;
    }
    if (tagName === "td" && !info.td_classes) {
      const cls = getClassName(opening);
      if (cls) info.td_classes = cls;
    }
    if (tagName === "colgroup") {
      info.has_colgroup = true;
    }

    ts.forEachChild(node, walk);
  }

  walk(jsxElement);
  return info.has_table ? info : null;
}

// ---------------------------------------------------------------------------
// 8. Layout context detection
// ---------------------------------------------------------------------------

function extractLayoutContext(annotatedElement, parentElement, allSiblings, tokenMap) {
  const ctx = {};

  if (parentElement) {
    const parentCls = getClassName(parentElement);
    const parentClasses = splitClasses(parentCls);

    if (parentClasses.includes("flex")) {
      ctx.parent_direction = parentClasses.includes("flex-col") ? "column" : "row";

      const parentStyles = getInlineStyles(parentElement, tokenMap.tokens);
      if (parentStyles.gap) ctx.parent_gap = parentStyles.gap;
    }
  }

  // Determine width fraction from annotated element's classes
  const cls = getClassName(annotatedElement);
  const classes = splitClasses(cls);

  for (const c of classes) {
    const wf = resolveWidthFraction(c);
    if (wf !== null) { ctx.width_fraction = wf; break; }

    const ff = resolveFlexFraction(c);
    if (ff !== null) { ctx.flex_value = ff; break; }
  }

  // Compute flex fractions from siblings
  if (ctx.flex_value !== undefined && allSiblings.length > 0) {
    let totalFlex = 0;
    for (const sib of allSiblings) {
      const sibCls = splitClasses(getClassName(sib));
      let sibFlex = 0;
      for (const sc of sibCls) {
        const f = resolveFlexFraction(sc);
        if (f !== null) { sibFlex = f; break; }
      }
      totalFlex += sibFlex || 1;
    }
    if (totalFlex > 0) {
      ctx.width_fraction = ctx.flex_value / totalFlex;
    }
    delete ctx.flex_value;
  }

  if (ctx.width_fraction === undefined) {
    if (ctx.parent_direction === "column" || !parentElement) {
      ctx.width_fraction = 1.0;
    }
  }

  ctx.sibling_count = allSiblings.length;
  ctx.sibling_index = -1; // set by caller

  return ctx;
}

// ---------------------------------------------------------------------------
// 9. Color collection
// ---------------------------------------------------------------------------

function collectColors(jsxElement, tokenMap) {
  const colors = new Set();

  function walk(node) {
    let opening;
    if (ts.isJsxElement(node)) {
      opening = node.openingElement;
    } else if (ts.isJsxSelfClosingElement(node)) {
      opening = node;
    }

    if (opening) {
      const cls = getClassName(opening);
      for (const c of splitClasses(cls)) {
        const resolved = resolveTailwindColor(c, tokenMap.tokens);
        if (resolved) colors.add(resolved.resolved);
      }

      // Inline style color values
      const styles = getInlineStyles(opening, tokenMap.tokens);
      for (const [k, v] of Object.entries(styles)) {
        if (k.includes("color") || k === "background" || k === "border") {
          if (v.startsWith("#") || v.startsWith("rgb")) colors.add(v);
        }
      }
    }

    ts.forEachChild(node, walk);
  }

  walk(jsxElement);
  return [...colors];
}

// ---------------------------------------------------------------------------
// 10. Type scale usage collection
// ---------------------------------------------------------------------------

function collectTypeScales(jsxElement, classRules) {
  const scales = new Set();

  function walk(node) {
    let opening;
    if (ts.isJsxElement(node)) opening = node.openingElement;
    else if (ts.isJsxSelfClosingElement(node)) opening = node;

    if (opening) {
      const cls = getClassName(opening);
      for (const c of splitClasses(cls)) {
        if (c.startsWith("t-") && classRules[c]) scales.add(c);
      }
    }
    ts.forEachChild(node, walk);
  }

  walk(jsxElement);
  return [...scales];
}

// ---------------------------------------------------------------------------
// 11. Main: process a single .tsx file
// ---------------------------------------------------------------------------

function processPage(filePath, tokenMap) {
  const code = readFileSync(filePath, "utf-8");
  const pageName = basename(filePath, ".tsx");
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const elements = [];

  // Find all JSX elements with data-sigma-notes
  function findAnnotated(node, parentOpening, siblings) {
    let opening = null;
    let jsxNode = null;

    if (ts.isJsxElement(node)) {
      opening = node.openingElement;
      jsxNode = node;
    } else if (ts.isJsxSelfClosingElement(node)) {
      opening = node;
      jsxNode = node;
    }

    if (opening) {
      const notes = getJsxAttributeValue(opening, "data-sigma-notes");
      if (notes) {
        const cls = getClassName(opening);
        const inlineStyles = getInlineStyles(opening, tokenMap.tokens);
        const resolvedWrapper = resolveWrapperStyles(cls, inlineStyles, tokenMap);

        // Layout context
        const layout = extractLayoutContext(opening, parentOpening, siblings, tokenMap);
        // Find sibling index
        if (parentOpening && siblings.length > 0) {
          for (let i = 0; i < siblings.length; i++) {
            if (siblings[i] === node) {
              layout.sibling_index = i;
              break;
            }
          }
        }

        // Children (shallow)
        const children = ts.isJsxElement(node)
          ? extractChildren(node, tokenMap, sourceFile, 0)
          : [];

        // Chart detection
        const chart = ts.isJsxElement(node) ? extractChartInfo(node) : null;

        // Table detection
        const table = ts.isJsxElement(node) ? extractTableInfo(node, tokenMap) : null;

        // Color collection
        const colorsUsed = collectColors(jsxNode, tokenMap);

        // Type scale usage
        const typeScalesUsed = collectTypeScales(jsxNode, tokenMap.classRules);

        const element = {
          index: elements.length,
          notes,
          tag: opening.tagName.getText(),
          classes: cls,
          resolved_wrapper: resolvedWrapper,
        };

        if (children.length > 0) element.children = children;
        if (chart) element.chart = chart;
        if (table) element.table = table;
        if (colorsUsed.length > 0) element.colors_used = colorsUsed;
        if (typeScalesUsed.length > 0) element.type_scales_used = typeScalesUsed;
        element.layout = layout;

        elements.push(element);
      }
    }

    // Continue walking to find nested annotated elements
    if (ts.isJsxElement(node)) {
      const childSiblings = node.children.filter(
        c => ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c)
      );
      for (const child of node.children) {
        findAnnotated(child, opening, childSiblings);
      }
    } else {
      ts.forEachChild(node, child => findAnnotated(child, parentOpening, siblings));
    }
  }

  ts.forEachChild(sourceFile, node => findAnnotated(node, null, []));

  return { page: pageName, elements };
}

// ---------------------------------------------------------------------------
// 12. Main entry point
// ---------------------------------------------------------------------------

const tokenMap = parseTokenMap(readFileSync(cssPath, "utf-8"));

console.log(`Extracting from: ${projectRoot}`);
console.log(`Token map: ${Object.keys(tokenMap.tokens).length} tokens, ${Object.keys(tokenMap.classRules).length} class rules`);

mkdirSync(outDir, { recursive: true });

const tsxFiles = readdirSync(pagesDir).filter(f => f.endsWith(".tsx")).sort();
console.log(`Found ${tsxFiles.length} page files: ${tsxFiles.join(", ")}`);

let totalElements = 0;

for (const file of tsxFiles) {
  const filePath = join(pagesDir, file);
  const result = processPage(filePath, tokenMap);
  const outPath = join(outDir, `${result.page}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");
  console.log(`  ${result.page}: ${result.elements.length} annotated elements`);
  totalElements += result.elements.length;
}

console.log(`\nDone. ${totalElements} elements extracted to ${outDir}/`);
