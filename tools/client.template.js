window.__ModuleLoader__.load({
  id: 'dsh-locale-zh-tw',
  factory() {
    const DATA = /*__DATA__*/null;

    const PAIRS = new Map();
    let maxLen = 1;
    for (const [s, t] of DATA.phrases) {
      PAIRS.set(s, t);
      if (s.length > maxLen) maxLen = s.length;
    }
    for (const [s, t] of DATA.chars) {
      if (!PAIRS.has(s)) PAIRS.set(s, t);
    }

    const cache = new Map();
    function convert(input) {
      if (typeof input !== 'string' || input === '') return input;
      const hit = cache.get(input);
      if (hit !== undefined) return hit;
      let out = '';
      let i = 0;
      while (i < input.length) {
        let step = 0;
        const limit = Math.min(maxLen, input.length - i);
        for (let len = limit; len >= 1; len -= 1) {
          const translated = PAIRS.get(input.slice(i, i + len));
          if (translated !== undefined) {
            out += translated;
            i += len;
            step = len;
            break;
          }
        }
        if (step === 0) {
          out += input[i];
          i += 1;
        }
      }
      if (cache.size < 20000) cache.set(input, out);
      return out;
    }

    return {
      inject: ['locale'],
      apply(ctx) {
        const locale = ctx.locale;
        ctx.effect(
          () => locale.addLanguage({ id: 'zh-TW', label: '繁體中文', fallback: 'zh' }),
          'dsh-locale-zh-tw: language',
        );

        const registered = new Set();
        function sync() {
          const all = locale.dicts;
          if (!(all instanceof Map)) return;
          for (const [ns, byLocale] of all) {
            if (registered.has(ns) || !(byLocale instanceof Map)) continue;
            const zh = byLocale.get('zh');
            if (!zh) continue;
            registered.add(ns);
            const proxy = new Proxy({}, {
              get(_target, key) {
                if (typeof key !== 'string') return undefined;
                const value = zh[key];
                return typeof value === 'string' ? convert(value) : undefined;
              },
              has(_target, key) {
                return typeof key === 'string' && typeof zh[key] === 'string';
              },
            });
            ctx.effect(
              () => locale.register(ns, 'zh-TW', proxy),
              'dsh-locale-zh-tw: ' + ns,
            );
          }
        }

        sync();
        const timer = setInterval(sync, 300);
        ctx.effect(() => () => clearInterval(timer), 'dsh-locale-zh-tw: sync timer');
      },
    };
  },
});
