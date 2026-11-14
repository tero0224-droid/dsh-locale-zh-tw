import fs from 'node:fs';

const src = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8');
let captured = null;
globalThis.window = { __ModuleLoader__: { load(spec) { captured = spec; } } };
// Evaluate the client bundle as a script.
new Function(src)();
if (!captured || captured.id !== 'dsh-locale-zh-tw') throw new Error('bundle did not register');

const zhDict = {
  'message.retry.active': '正在重试模型请求',
  'message.stopped': '已停止',
  'message.failure.auth': 'API 密钥无效',
  'settings.title': '设置',
  'plugins.label': '插件',
};
const dicts = new Map([['chat', new Map([['zh', zhDict], ['en', {}]])]]);
const registrations = [];
const fakeLocale = {
  dicts,
  addLanguage(input) { registrations.push(['language', input]); return () => {}; },
  register(ns, locale, dict) { registrations.push(['dict', ns, locale]); return () => {}; },
};
const ctx = { locale: fakeLocale, effect(fn) { const d = fn(); return typeof d === 'function' ? d : () => {}; } };

const mod = captured.factory();
mod.apply(ctx);

console.log('registrations:', JSON.stringify(registrations));
const entry = registrations.find((r) => r[0] === 'dict');
if (!entry) throw new Error('no dictionary registered');
const proxy = fakeLocale.__lastDict ?? null;
// Recreate the proxy the plugin registered by calling register with a capture.
let registeredProxy = null;
fakeLocale.register = (ns, locale, dict) => { registeredProxy = dict; return () => {}; };
mod.apply(ctx);
if (!registeredProxy) throw new Error('proxy missing');

for (const key of Object.keys(zhDict)) {
  console.log(key, '=>', registeredProxy[key]);
}
const proxy2 = registeredProxy;
console.log('missing key =>', proxy2['nope']);
console.log('symbol key =>', proxy2[Symbol.iterator]);

process.exit(0);
