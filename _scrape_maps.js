const fs = require('fs');
const https = require('https');

const MAP_LINKS = [
  ['蘭州', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=62&id=312'],
  ['長安', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=62&id=320'],
  ['洛陽', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=62&id=319'],
  ['開封', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=62&id=318'],
  ['北京', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=62&id=317'],
  ['路瓦因', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=62&id=617'],
  ['玉門關', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=63&id=478'],
  ['鳴沙山', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=63&id=479'],
  ['月牙泉', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=63&id=480'],
  ['塔爾寺', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=63&id=481'],
  ['華清池', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=63&id=482'],
  ['秦始皇陵', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=63&id=483'],
  ['鄭州', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=64&id=484'],
  ['秦始皇陵密室', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=64&id=485'],
  ['黃河', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=64&id=486'],
  ['龍門石窟入口', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=64&id=487'],
  ['莫高窟入口', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=64&id=488'],
  ['龍門石窟', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=64&id=489'],
  ['洞庭湖', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=490'],
  ['莫高窟1樓', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=491'],
  ['黃河灣', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=492'],
  ['泰山南麓', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=493'],
  ['莫高窟2樓', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=494'],
  ['泰山頂峰', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=495'],
  ['嵩山', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=496'],
  ['少林寺', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=497'],
  ['泰山北麓', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=65&id=498'],
  ['萬里長城', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=66&id=499'],
  ['敦煌', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=66&id=500'],
  ['火焰山', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=66&id=501'],
  ['南戴河', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=66&id=502'],
  ['火焰洞1樓', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=66&id=503'],
  ['火焰洞2樓', 'https://www.mohunclassic.com/twn/guide/detail?div=guide&bid=57&bid_2=66&id=504'],
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMap(html, name) {
  const text = stripTags(html);
  const monsters = [];
  // Look for patterns like "6 亂軍" near 怪物資訊
  const idx = text.indexOf('怪物資訊');
  const chunk = idx >= 0 ? text.slice(idx, idx + 800) : text.slice(0, 1200);
  const re = /(\d{1,3})\s+([^\d\s]{2,12})(?:\s+([^\d]{0,20}?))?(?=\s+\d{1,3}\s+[^\d\s]{2}|$|上一篇|下一篇)/g;
  let m;
  const section = chunk.replace(/等級\s*怪物名稱\s*特殊事項\s*/, '');
  // simpler: after 怪物資訊, pairs of number + name
  const simple = [...section.matchAll(/\b(\d{1,3})\s+([\u4e00-\u9fff〔〕\[\]]{2,16})/g)];
  for (const x of simple) {
    const lv = +x[1];
    const mon = x[2].replace(/特殊事項|等級|怪物名稱|NPC|編號/g, '').trim();
    if (!mon || mon.length < 2) continue;
    if (['上一篇', '下一篇', '目錄', '遊戲'].some(k => mon.includes(k))) continue;
    monsters.push({ lv, name: mon });
  }
  // unique by name
  const seen = new Set();
  const uniq = [];
  for (const m of monsters) {
    if (seen.has(m.name)) continue;
    seen.add(m.name);
    uniq.push(m);
  }
  return { name, monsters: uniq, sample: chunk.slice(0, 300) };
}

(async () => {
  const out = {};
  for (const [name, url] of MAP_LINKS) {
    try {
      const html = await fetchText(url);
      out[name] = parseMap(html, name);
      console.log(name, '->', out[name].monsters.map(m => m.lv + m.name).join(', ') || '(none)');
    } catch (e) {
      console.log(name, 'ERR', e.message);
      out[name] = { name, monsters: [], error: e.message };
    }
  }
  fs.writeFileSync('assets/guide_maps.json', JSON.stringify(out, null, 2), 'utf8');
  console.log('saved assets/guide_maps.json');
})();
