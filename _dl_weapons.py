import urllib.request, re, os

pages = {
    'sword': 'http://mx.moyoi.cn/d/gameinfo/zhuangbei/wu_qi/2015/1009/1977.html',
    'spear': 'http://mx.moyoi.cn/d/gameinfo/zhuangbei/wu_qi/2015/1009/1978.html',
    'bow': 'http://mx.moyoi.cn/d/gameinfo/zhuangbei/wu_qi/2015/1009/1976.html',
    'blade': 'http://mx.moyoi.cn/d/gameinfo/zhuangbei/wu_qi/2015/1009/1975.html',
    'hidden': 'http://mx.moyoi.cn/d/gameinfo/zhuangbei/wu_qi/2015/1009/1974.html',
    'fist': 'http://mx.moyoi.cn/d/gameinfo/zhuangbei/wu_qi/2015/1009/1973.html',
}
os.makedirs('newui/weapon_tables', exist_ok=True)
for k, u in pages.items():
    req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')
    imgs = re.findall(r'src="(https?://[^"]+/i/allimg/[^"]+\.(?:png|jpg))"', html)
    imgs += re.findall(r'src="(/i/allimg/[^"]+\.(?:png|jpg))"', html)
    imgs = ['https://mx.moyoi.cn' + i if i.startswith('/') else i for i in imgs]
    print(k, imgs)
    if imgs:
        path = f'newui/weapon_tables/{k}.png'
        urllib.request.urlretrieve(imgs[0], path)
        print(' saved', path)
