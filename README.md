# dsh-locale-zh-tw

Traditional Chinese (Taiwan) interface language pack for the [DeepSeek Harness](https://github.com/deepseek-ai) web GUI.

DeepSeek Harness ships eight interface languages — English, Simplified Chinese, Japanese, Spanish, French, German, Russian and Brazilian Portuguese. This bundle adds **繁體中文** to that list without shipping thousands of translated strings: at lookup time it converts the installed Simplified Chinese dictionary entries to Taiwan Traditional Chinese, so new UI strings and newly installed plugins are covered automatically.

## Install

```sh
# from GitHub
dsh plugin --profile <profile> add github:cobrasnac/dsh-locale-zh-tw

# or from a local checkout
dsh plugin --profile <profile> add /absolute/path/to/dsh-locale-zh-tw
```

In DSH Desktop, **Plugins → Add plugin → local directory** installs a checkout just as well. Restart DSH once after installing; the bundle is composed at boot.

Requires DSH `>= 0.2.1` (the `ctx.locale.addLanguage` / `ctx.locale.register` language-pack API).

## Use

**Settings → General → Language → 繁體中文**. The choice is applied immediately and stored as `locale.preference`, so later sessions start in Traditional Chinese.

## How it works

- `ctx.locale.addLanguage({ id: 'zh-TW', label: '繁體中文', fallback: 'zh' })` registers the language; keys missing from the pack fall back to Simplified Chinese rather than English.
- For every namespace the locale runtime already holds, the pack registers a lazy `zh-TW` dictionary. Reading a key converts the shipped `zh` string on demand, so there is exactly one source of truth.
- A short polling sync picks up namespaces that plugins register after boot.
- The conversion table is generated from OpenCC (`s2twp`) at build time — **2,644 characters + 114 UI phrases** — and embedded in `client.js`. No runtime dependency, no network access, no extra model request.

## Limitations

- Strings captured at registration time outside the render path (for example command descriptions) keep the language they were registered under, until re-registration. This is a limitation of the locale service itself.
- Rule-based conversion can choose an imperfect term where one Simplified word maps to several Taiwan words. Report such cases and the phrase table can be extended.
- The pack reads the locale runtime's internal `dicts` map. If a future DSH release changes that structure, the pack needs a small update.
- Not every product string may exist in the Simplified dictionary; those keys fall back to English or the key itself, exactly like every other locale.

## Development

```sh
cd tools
npm install          # opencc-js, build-time only
node build.mjs       # regenerates ../client.js from tools/client.template.js
node smoke.mjs       # fake locale runtime: language + dictionary + conversions
```

`tools/client.template.js` holds the runtime code; `build.mjs` injects the generated
character/phrase table. To extend the wording, edit the `overrides` list in `build.mjs`
and rebuild.

## License

MIT — see [LICENSE](LICENSE).
