/**
 * Rebuild ../client.js from the shipped zh dictionaries' character inventory.
 *
 * Usage (needs opencc-js, see tools/package.json):
 *   cd tools && npm install && node build.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import * as OpenCC from 'opencc-js';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '..');
const s2t = OpenCC.Converter({ from: 'cn', to: 'twp' });

const chars = [];
for (let cp = 0x4e00; cp <= 0x9fff; cp += 1) {
  const s = String.fromCodePoint(cp);
  const t = s2t(s);
  if (t !== s && [...t].length === 1) chars.push([s, t]);
}

const seeds = [
  '设置', '软件', '硬件', '项目', '默认', '保存', '撤销', '重做', '文件', '文件夹', '目录',
  '网络', '视频', '音频', '信息', '质量', '用户', '登录', '注销', '加载', '刷新', '剪切',
  '粘贴', '鼠标', '硬盘', '内存', '光标', '服务器', '数据库', '字节', '带宽', '打印',
  '数组', '字符串', '队列', '线程', '进程', '内核', '调试', '日志', '窗口', '标签页',
  '搜索', '查找', '匹配', '支持', '点击', '弹窗', '拖拽', '滚动', '快捷键', '剪贴板',
  '屏幕', '分辨率', '图标', '界面', '交互', '反馈', '邮箱', '账号', '余额', '充值',
  '会话', '插件', '权限', '沙箱', '仓库', '分支', '提交', '合并', '部署', '构建',
  '依赖', '环境变量', '变量', '常量', '函数', '对象', '接口', '实例', '导入', '导出',
  '迁移', '备份', '恢复', '重命名', '复制', '智能体', '上下文', '模型', '提示词', '工作区',
  '回车', '空格', '选项卡', '下拉', '输入框', '复选框', '单选框', '按钮', '列表', '菜单',
  '工具栏', '状态栏', '侧边栏', '对话框', '通知', '时间戳', '时区', '主题', '字体', '字号',
  '存储', '缓存', '快照', '回滚', '仓库地址', '账号与余额', '通用设置', '内置插件', '插件市场',
  '侧边卡片', '工作步骤', '代码工作视图', '回答结束后', '全部回复', '编辑快捷键',
];
const phrases = [];
for (const s of seeds) {
  const t = s2t(s);
  if (t !== s) phrases.push([s, t]);
}

// UI idiom overrides: Taiwan wording that is not a pure glyph conversion.
const overrides = [
  ['密钥', '金鑰'], ['用户', '使用者'], ['账号', '帳號'], ['加载', '載入'],
  ['刷新', '重新整理'], ['点击', '點選'], ['支持', '支援'], ['质量', '品質'],
  ['撤销', '復原'], ['字节', '位元組'], ['线程', '執行緒'], ['进程', '行程'],
  ['打印', '列印'], ['屏幕', '螢幕'], ['分辨率', '解析度'], ['图标', '圖示'],
  ['搜索', '搜尋'], ['拖拽', '拖曳'], ['滚动', '捲動'], ['快捷键', '快速鍵'],
  ['界面', '介面'], ['缓存', '快取'], ['登录', '登入'], ['注销', '登出'],
  ['服务器', '伺服器'], ['数据库', '資料庫'], ['带宽', '頻寬'], ['数组', '陣列'],
  ['字符串', '字串'], ['队列', '佇列'], ['调试', '偵錯'], ['日志', '日誌'],
  ['窗口', '視窗'], ['标签页', '分頁'], ['插件', '外掛'], ['任务', '任務'],
  ['会话', '工作階段'], ['默认', '預設'], ['保存', '儲存'], ['设置', '設定'],
  ['文件', '檔案'], ['目录', '目錄'], ['网络', '網路'], ['视频', '影片'],
  ['鼠标', '滑鼠'], ['内存', '記憶體'], ['硬盘', '硬碟'], ['剪贴板', '剪貼簿'],
];
const overrideKeys = new Set(overrides.map(([s]) => s));
for (let i = phrases.length - 1; i >= 0; i -= 1) {
  if (overrideKeys.has(phrases[i][0])) phrases.splice(i, 1);
}
phrases.push(...overrides);

const data = JSON.stringify({ chars, phrases });

const template = fs.readFileSync(path.join(HERE, 'client.template.js'), 'utf8');
const out = template.replace('/*__DATA__*/null', data);
fs.writeFileSync(path.join(ROOT, 'client.js'), out);
console.log(`client.js written: ${chars.length} characters, ${phrases.length} phrases, ${out.length} bytes`);
