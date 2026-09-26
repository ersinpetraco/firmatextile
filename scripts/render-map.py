"""Draws the contact-section map from OpenStreetMap data in the site's palette.

Usage: python3 scripts/render-map.py osm.json public/images/map-nosab [--labels] [--style=google]
--style=google mimics a recoloured Google map: warm grey, no building footprints, every named road
labelled in mixed case with Google-style abbreviations (Cd., Blv., Sk.).
--plain draws Meşe Caddesi like any other road (no gold highlight).
--center=LAT,LON centres the map (the page puts its pin at the centre).
osm.json is an Overpass `out geom` export of highways, buildings, waterways and green landuse
around NOSAB. Map data (c) OpenStreetMap contributors, ODbL; the site credits it on the map.
"""
import json, math, sys
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
LABELS = '--labels' in sys.argv[3:]
GOOGLE = '--style=google' in sys.argv[3:]
PLAIN = '--plain' in sys.argv[3:]
_c = next((a.split('=', 1)[1] for a in sys.argv[3:] if a.startswith('--center=')), None)
CENTER = (40.2393, 28.9364)          # middle of Meşe Caddesi, NOSAB
if _c: CENTER = tuple(float(v) for v in _c.split(','))
W, H, SS = 1000, 650, 3              # output size (2x the on-screen box) and supersampling
M_PER_PX = 2.7                       # metres per output pixel

BG, BUILDING, GREEN, WATER = '#211a16', '#2d251f', '#24221a', '#26302f'
MINOR, MAJOR, MESE = '#4b4137', '#6f6353', '#b7a47a'
if GOOGLE:
    BG, BUILDING, GREEN, WATER = '#3a3531', None, '#3b3a31', '#3a4446'
    MINOR, MAJOR, MESE = '#57514a', '#77706a', '#c9b27c'
MAJOR_T = {'motorway', 'trunk', 'primary', 'secondary', 'motorway_link', 'trunk_link',
           'primary_link', 'secondary_link'}
MINOR_T = {'tertiary', 'tertiary_link', 'residential', 'unclassified', 'service', 'living_street'}

lat0, lon0 = CENTER
kx = 111320 * math.cos(math.radians(lat0))
ky = 110574
def xy(p):
    x = (p['lon'] - lon0) * kx / M_PER_PX + W / 2
    y = (lat0 - p['lat']) * ky / M_PER_PX + H / 2
    return (x * SS, y * SS)

els = json.load(open(SRC))['elements']
img = Image.new('RGB', (W * SS, H * SS), BG)
d = ImageDraw.Draw(img)

def poly(e, fill):
    pts = [xy(p) for p in e['geometry']]
    if len(pts) > 2: d.polygon(pts, fill=fill)
def line(e, color, w):
    pts = [xy(p) for p in e['geometry']]
    if len(pts) > 1:
        d.line(pts, fill=color, width=int(w * SS), joint='curve')
        for x, y in (pts[0], pts[-1]):   # round the ends
            r = w * SS / 2; d.ellipse((x - r, y - r, x + r, y + r), fill=color)

for e in els:
    t = e.get('tags', {})
    if t.get('landuse') in ('grass', 'forest', 'meadow', 'farmland', 'orchard'): poly(e, GREEN)
for e in els:
    if BUILDING and 'building' in e.get('tags', {}): poly(e, BUILDING)
for e in els:
    if 'waterway' in e.get('tags', {}): line(e, WATER, 3)
for e in els:
    if e.get('tags', {}).get('highway') in MINOR_T: line(e, MINOR, 2)
for e in els:
    if e.get('tags', {}).get('highway') in MAJOR_T: line(e, MAJOR, 4)
for e in els:
    if not PLAIN and 'Meşe' in e.get('tags', {}).get('name', ''): line(e, MESE, 5)

# Road names along the roads, letter-spaced capitals like the site's labels, with a dark halo.
def tr_upper(t): return t.replace('i', 'İ').replace('ı', 'I').upper()
def abbrev(t):
    for a, b in ((' Caddesi', ' Cd.'), (' Cadde', ' Cd.'), (' Bulvarı', ' Blv.'), (' Sokağı', ' Sk.'), (' Sokak', ' Sk.')):
        if t.endswith(a): return t[:-len(a)] + b
    return t
FONT = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", (23 if GOOGLE else 22) * SS)
TRACK = 0 if GOOGLE else 0.14 * 22 * SS     # letter-spacing, like the site's 0.14em labels
def text_width(t): return sum(FONT.getlength(ch) for ch in t) + TRACK * (len(t) - 1)
def draw_tracked(dr, x, y, t, **kw):
    for ch in t:
        dr.text((x, y), ch, font=FONT, **kw); x += FONT.getlength(ch) + TRACK
placed = []
def label(name, polylines, color, offset=0):
    """Write the name along the longest nearly straight run of the road that lies inside the frame."""
    text = abbrev(name) if GOOGLE else tr_upper(name)
    tw, th = int(text_width(text)), int(FONT.size * 1.25)
    inside = lambda x, y: 0.06 * W * SS < x < 0.94 * W * SS and 0.08 * H * SS < y < 0.84 * H * SS
    best = None
    for pts in polylines:
        for i in range(len(pts)):
            run = 0
            for j in range(i + 1, len(pts)):
                run += math.dist(pts[j - 1], pts[j])
                chord = math.dist(pts[i], pts[j])
                if chord < 0.97 * run: break                      # the road bends here
                (x1, y1), (x2, y2) = pts[i], pts[j]
                if not (inside(x1, y1) and inside(x2, y2)): continue
                if best is None or chord > best[0]:
                    best = (chord, (x1 + x2) / 2, (y1 + y2) / 2, math.degrees(math.atan2(y2 - y1, x2 - x1)))
    if not best or best[0] < 0.9 * tw: return
    _, mx, my, ang = best
    if ang > 90: ang -= 180
    if ang <= -90: ang += 180
    if offset:   # sit beside the road instead of on it
        r = math.radians(ang); mx -= math.sin(r) * offset; my += math.cos(r) * offset
    tile = Image.new('RGBA', (tw + 40, th + 40), (0, 0, 0, 0))
    draw_tracked(ImageDraw.Draw(tile), 20, 14, text, fill=color, stroke_width=5 * SS // 3, stroke_fill=BG)
    tile = tile.rotate(-ang, expand=True, resample=Image.BICUBIC)
    box = (mx - tile.width / 2, my - tile.height / 2, mx + tile.width / 2, my + tile.height / 2)
    if any(not (box[2] < q[0] or box[0] > q[2] or box[3] < q[1] or box[1] > q[3]) for q in placed): return
    placed.append(box)
    img.paste(tile, (int(box[0]), int(box[1])), tile)

if LABELS:
    by_name = {}
    for e in els:
        t = e.get('tags', {})
        if t.get('name') and t.get('highway') in MAJOR_T | MINOR_T:
            by_name.setdefault(t['name'], []).append([xy(p) for p in e['geometry']])
    if not PLAIN:
        label('Meşe Caddesi', by_name.get('Meşe Caddesi', []), MESE, offset=(19 * SS if GOOGLE else 0))
    if GOOGLE:   # every named road, most important first; collisions decide what fits
        rank = {'trunk': 0, 'primary': 1, 'secondary': 2, 'tertiary': 3, 'residential': 4, 'unclassified': 5}
        names = {}
        for e in els:
            t = e.get('tags', {})
            if t.get('name') and t.get('highway') in rank and (PLAIN or t['name'] != 'Meşe Caddesi'):
                names.setdefault(t['name'], []).append([xy(p) for p in e['geometry']])
                by_name.setdefault(t['name'], names[t['name']])
        order = sorted(names, key=lambda n: min(rank[e['tags']['highway']] for e in els
                                                 if e.get('tags', {}).get('name') == n and e['tags'].get('highway') in rank))
        for name in order:
            label(name, names[name], '#cfc6b8')
    else:
        for name in ('Nilüfer Bulvarı', 'Bülent Ecevit Caddesi', 'Atatürk Bulvarı', 'Siyah Cadde'):
            label(name, by_name.get(name, []), '#9a8e7c')

img = img.resize((W, H), Image.LANCZOS)
img.save(OUT + '.webp', 'WEBP', quality=86, method=6)
img.save(OUT + '.jpg', 'JPEG', quality=86, optimize=True, progressive=True)
print('wrote', OUT + '.webp/.jpg')
