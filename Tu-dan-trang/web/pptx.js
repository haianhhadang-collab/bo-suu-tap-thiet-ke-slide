/* Tự dàn trang — ghi IR thành file .pptx (dựa trên gói khung tối giản sinh từ python-pptx). */
(function (G) {
'use strict';
const T = G.TuDanTrang;
const EMU = 914400, E = v => Math.round(v * EMU);
const NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
const clr = (h, a) => `<a:srgbClr val="${h.replace('#', '').toUpperCase()}">${a != null && a < 1 ? `<a:alpha val="${Math.round(a * 100000)}"/>` : ''}</a:srgbClr>`;

function fillXml(f) {
  if (!f) return '<a:noFill/>';
  if (f.grad) {
    const n = f.grad.length, al = f.alphas || [];
    const gs = f.grad.map((c, i) => `<a:gs pos="${Math.round(i * 100000 / Math.max(n - 1, 1))}">${clr(c, al[i])}</a:gs>`).join('');
    const shade = f.radial ? '<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>'
      : `<a:lin ang="${Math.round((f.angle || 0) * 60000) % 21600000}" scaled="0"/>`;
    return `<a:gradFill rotWithShape="1"><a:gsLst>${gs}</a:gsLst>${shade}</a:gradFill>`;
  }
  return `<a:solidFill>${clr(f.color, f.alpha)}</a:solidFill>`;
}
const lineXml = l => l ? `<a:ln w="${Math.round(l.w * 12700)}"><a:solidFill>${clr(l.color, l.alpha)}</a:solidFill></a:ln>` : '<a:ln><a:noFill/></a:ln>';
function effXml(el) {
  let s = '';
  if (el.glow) s += `<a:glow rad="${Math.round(el.glow.pt * 12700)}">${clr(el.glow.color, el.glow.alpha)}</a:glow>`;
  if (el.shadow) s += `<a:outerShdw blurRad="${el.shadow.blur * 12700}" dist="${el.shadow.dist * 12700}" dir="5400000" algn="t" rotWithShape="0">${clr(el.shadow.color, el.shadow.alpha)}</a:outerShdw>`;
  return `<a:effectLst>${s}</a:effectLst>`;
}
const xfrm = (el, rot) => `<a:xfrm${rot ? ` rot="${Math.round(rot * 60000)}"` : ''}><a:off x="${E(el.x)}" y="${E(el.y)}"/><a:ext cx="${E(el.w)}" cy="${E(el.h)}"/></a:xfrm>`;

function txBody(spec, tag = 'p:txBody') {
  const anch = { t: 't', m: 'ctr', b: 'b' }[spec ? spec.anchor : 't'] || 't';
  const ins = spec ? E(spec.margin || 0) : 0;
  const body = `<a:bodyPr wrap="square" lIns="${ins}" tIns="${ins}" rIns="${ins}" bIns="${ins}" anchor="${anch}" rtlCol="0"><a:noAutofit/></a:bodyPr><a:lstStyle/>`;
  if (!spec) return `<${tag}>${body}<a:p><a:endParaRPr lang="vi-VN"/></a:p></${tag}>`;
  const paras = spec.paras.map(p => {
    const algn = { l: 'l', c: 'ctr', r: 'r', j: 'just' }[p.align] || 'l';
    let ppr = `<a:pPr algn="${algn}"`;
    if (p.bullet) ppr += ` marL="${E(p.bullet.indent)}" indent="${-E(p.bullet.indent)}"`;
    ppr += `><a:lnSpc><a:spcPts val="${Math.round(p.ln * 100)}"/></a:lnSpc>`;
    if (p.after) ppr += `<a:spcAft><a:spcPts val="${Math.round(p.after * 100)}"/></a:spcAft>`;
    ppr += p.bullet ? `<a:buClr>${clr(p.bullet.color)}</a:buClr><a:buFont typeface="${/^[●■•–—♦]$/.test(p.bullet.char) ? 'Segoe UI' : 'Segoe UI Symbol'}"/><a:buChar char="${esc(p.bullet.char)}"/>` : '<a:buNone/>';
    ppr += '</a:pPr>';
    const runs = p.runs.map(r => `<a:r><a:rPr lang="vi-VN" sz="${Math.round(r.size * 100)}" b="${r.bold ? 1 : 0}" i="${r.italic ? 1 : 0}" dirty="0"><a:solidFill>${clr(r.color)}</a:solidFill><a:latin typeface="${esc(r.font)}"/><a:cs typeface="${esc(r.font)}"/></a:rPr><a:t>${esc(r.t)}</a:t></a:r>`).join('');
    return `<a:p>${ppr}${runs}</a:p>`;
  }).join('');
  return `<${tag}>${body}${paras}</${tag}>`;
}

function shapeXml(el, id, rid) {
  const name = esc(el.name || ('Shape ' + id));
  if (el.t === 'text') {
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm(el)}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>${txBody(el.text)}</p:sp>`;
  }
  if (el.t === 'shape') {
    const av = el.adj != null ? `<a:gd name="adj" fmla="val ${Math.round(el.adj * 100000)}"/>` : '';
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm(el, el.rot)}<a:prstGeom prst="${el.geom}"><a:avLst>${av}</a:avLst></a:prstGeom>${fillXml(el.fill)}${lineXml(el.line)}${effXml(el)}</p:spPr>${txBody(el.text)}</p:sp>`;
  }
  if (el.t === 'poly') {
    // pts là một đường [[x,y],…] hoặc nhiều đường [[[x,y],…],…] (gộp thành một hình nhiều nét)
    const rings = Array.isArray(el.pts[0][0]) ? el.pts : [el.pts], all = [].concat(...rings);
    const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(Math.max(...xs) - x0, 0.01), h = Math.max(Math.max(...ys) - y0, 0.01);
    const P = ([x, y]) => `<a:pt x="${E(x - x0)}" y="${E(y - y0)}"/>`;
    const paths = rings.map(pts => `<a:path w="${E(w)}" h="${E(h)}"><a:moveTo>${P(pts[0])}</a:moveTo>` + pts.slice(1).map(p => `<a:lnTo>${P(p)}</a:lnTo>`).join('') + (el.closed ? '<a:close/>' : '') + '</a:path>').join('');
    const geo = `<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="r" b="b"/><a:pathLst>${paths}</a:pathLst></a:custGeom>`;
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm({ x: x0, y: y0, w, h })}${geo}${el.closed ? fillXml(el.fill) : '<a:noFill/>'}${lineXml(el.line)}<a:effectLst/></p:spPr>${txBody(null)}</p:sp>`;
  }
  if (el.t === 'pic') {
    const c = el.crop;
    const src = c ? `<a:srcRect l="${Math.round(c.l * 100000)}" t="${Math.round(c.t * 100000)}" r="${Math.round(c.r * 100000)}" b="${Math.round(c.b * 100000)}"/>` : '';
    const geom = el.radius > 0 ? `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val ${Math.round(el.radius * 100000)}"/></a:avLst></a:prstGeom>` : '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>';
    return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="Ảnh ${id}" descr="${esc(el.img.caption || '')}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rid}"/>${src}<a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr>${xfrm(el)}${geom}</p:spPr></p:pic>`;
  }
  if (el.t === 'table') {
    const tot = el.rows.reduce((s, r) => s + r.h, 0);
    const grid = el.cols.map(w => `<a:gridCol w="${E(w)}"/>`).join('');
    const bd = side => `<a:${side} w="9525"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:${side}>`;
    const rows = el.rows.map(r => `<a:tr h="${E(r.h)}">` + r.cells.map(c => {
      const spec = { anchor: 'm', margin: 0, paras: [{ align: 'l', ln: Math.round(c.size * 1.15 * 10) / 10, runs: [{ t: c.text, font: c.font, size: c.size, bold: c.bold, italic: false, color: c.color }] }] };
      return `<a:tc>${txBody(spec, 'a:txBody')}<a:tcPr marL="${E(0.1)}" marR="${E(0.1)}" marT="${E(0.06)}" marB="${E(0.06)}" anchor="ctr">${bd('lnL')}${bd('lnR')}${bd('lnT')}${bd('lnB')}<a:solidFill>${clr(c.fill)}</a:solidFill></a:tcPr></a:tc>`;
    }).join('') + '</a:tr>').join('');
    return `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="${id}" name="${name}"/><p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr><p:nvPr/></p:nvGraphicFramePr><p:xfrm><a:off x="${E(el.x)}" y="${E(el.y)}"/><a:ext cx="${E(el.w)}" cy="${E(tot)}"/></p:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr firstRow="1" bandRow="1"/><a:tblGrid>${grid}</a:tblGrid>${rows}</a:tbl></a:graphicData></a:graphic></p:graphicFrame>`;
  }
  return '';
}

// ---------- animation (cùng cấu trúc với bản Python, đã kiểm tra trong PowerPoint)
const PRESETS = { fade: [10, 0], float: [42, 0], wipe: [22, 4], zoom: [53, 16], fly: [2, 4] };
function timingXml(steps, ids, mode) {
  steps = steps.filter(s => s.length);
  if (!steps.length || mode === 'none') return '';
  let n = 2; const nid = () => ++n;
  const setVis = sp => `<p:set><p:cBhvr><p:cTn id="${nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`;
  const anim = (sp, at, v0, v1, d) => `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${nid()}" dur="${d}" fill="hold"/><p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl><p:attrNameLst><p:attrName>${at}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0"><p:val><p:strVal val="${v0}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="${v1}"/></p:val></p:tav></p:tavLst></p:anim>`;
  const filt = (sp, f, d) => `<p:animEffect transition="in" filter="${f}"><p:cBhvr><p:cTn id="${nid()}" dur="${d}"/><p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl></p:cBhvr></p:animEffect>`;
  const effect = (sp, eff, node, d) => {
    const [pid, sub] = PRESETS[eff] || PRESETS.fade;
    let body = setVis(sp), extra = '';
    if (eff === 'float') { body += filt(sp, 'fade', d) + anim(sp, 'ppt_x', '#ppt_x', '#ppt_x', d) + anim(sp, 'ppt_y', '#ppt_y+.1', '#ppt_y', d); extra = ' decel="100000"'; }
    else if (eff === 'wipe') body += filt(sp, 'wipe(up)', d);
    else if (eff === 'zoom') body += anim(sp, 'ppt_w', '0', '#ppt_w', d) + anim(sp, 'ppt_h', '0', '#ppt_h', d) + filt(sp, 'fade', d);
    else if (eff === 'fly') { body += anim(sp, 'ppt_x', '#ppt_x', '#ppt_x', d) + anim(sp, 'ppt_y', '1+#ppt_h/2', '#ppt_y', d); extra = ' decel="100000"'; }
    else body += filt(sp, 'fade', d);
    return `<p:par><p:cTn id="${nid()}" presetID="${pid}" presetClass="entr" presetSubtype="${sub}" fill="hold" grpId="0" nodeType="${node}"${extra}><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${body}</p:childTnLst></p:cTn></p:par>`;
  };
  const group = (delay, inner) => `<p:par><p:cTn id="${nid()}" fill="hold"><p:stCondLst><p:cond delay="${delay}"/></p:stCondLst><p:childTnLst>${inner}</p:childTnLst></p:cTn></p:par>`;
  const dur = 550, gap = 120;
  const clicks = mode === 'click' ? [[steps[0]], ...steps.slice(1).map(s => [s])] : [steps];
  const bld = [];
  const pars = clicks.map((chain, ci) => {
    let t = 0;
    const groups = chain.map((step, si) => {
      const effs = step.map((st, k) => {
        const node = (ci === 0 && si === 0 && k === 0) ? 'afterEffect' : (k === 0 ? (mode === 'click' && si === 0 ? 'clickEffect' : 'afterEffect') : 'withEffect');
        const sp = ids.get(st.el);
        if (st.el.text && st.el.t !== 'pic') bld.push(`<p:bldP spid="${sp}" grpId="0"${st.el.fill ? ' animBg="1"' : ''}/>`);
        return effect(sp, st.eff, node, dur);
      }).join('');
      const g = group(t, effs); t += dur + gap; return g;
    }).join('');
    const cond = ci === 0 ? '<p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>' : '<p:cond delay="indefinite"/>';
    return `<p:par><p:cTn id="${nid()}" fill="hold"><p:stCondLst>${cond}</p:stCondLst><p:childTnLst>${groups}</p:childTnLst></p:cTn></p:par>`;
  }).join('');
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${pars}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst>${bld.length ? '<p:bldLst>' + bld.join('') + '</p:bldLst>' : ''}</p:timing>`;
}
function transitionXml(kind) {
  if (!kind || kind === 'none') return '';
  if (kind === 'morph') return '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159"><p:transition xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" spd="slow" p14:dur="1200"><p159:morph option="byObject"/></p:transition></mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>';
  const inner = { fade: '<p:fade/>', push: '<p:push dir="u"/>', wipe: '<p:wipe dir="r"/>' }[kind] || '<p:fade/>';
  return `<p:transition spd="med">${inner}</p:transition>`;
}

function slideXml(sl, mediaRid) {
  const ids = new Map(); let id = 1;
  const body = sl.els.map(el => { ids.set(el, ++id); return shapeXml(el, id, el.t === 'pic' ? mediaRid(el.img) : null); }).join('');
  const bg = sl.bg ? `<p:bg><p:bgPr>${fillXml(sl.bg.color ? { color: sl.bg.color } : { grad: sl.bg.grad, angle: sl.bg.angle, radial: sl.bg.radial })}<a:effectLst/></p:bgPr></p:bg>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld ${NS}><p:cSld>${bg}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${body}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>${transitionXml(sl.transition)}${timingXml(sl.steps, ids, sl.anim)}</p:sld>`;
}
function notesXml(text) {
  const paras = text.split('\n').map(t => `<a:p><a:r><a:rPr lang="vi-VN" dirty="0"/><a:t>${esc(t)}</a:t></a:r></a:p>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notes ${NS}><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Slide Image Placeholder 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg" idx="2"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="Notes Placeholder 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="3" sz="quarter"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${paras}</p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`;
}
const REL = t => 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/' + t;
const CT = { slide: 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml', notes: 'application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml' };
const IMG_CT = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff', emf: 'image/x-emf', wmf: 'image/x-wmf' };

async function toPptx(result) {
  const b64 = G.TU_DAN_TRANG_KHUNG;
  const zip = await JSZip.loadAsync(b64, { base64: true });
  let ct = await zip.file('[Content_Types].xml').async('string');
  let pres = await zip.file('ppt/presentation.xml').async('string');
  let prel = await zip.file('ppt/_rels/presentation.xml.rels').async('string');
  const usedExt = new Set(), media = new Map();
  let ridN = 100, sldIds = '';
  result.slides.forEach((sl, i) => {
    const n = i + 1, rels = [`<Relationship Id="rId1" Type="${REL('slideLayout')}" Target="../slideLayouts/slideLayout7.xml"/>`];
    const local = new Map(); let r = 1;
    const mediaRid = img => {
      if (local.has(img)) return local.get(img);
      if (!media.has(img)) { const ext = img.ext === 'jpeg' ? 'jpg' : img.ext; media.set(img, `image${media.size + 1}.${ext}`); usedExt.add(ext); zip.file('ppt/media/' + media.get(img), img.data); }
      const rid = 'rId' + (++r + 1); local.set(img, rid);
      rels.push(`<Relationship Id="${rid}" Type="${REL('image')}" Target="../media/${media.get(img)}"/>`);
      return rid;
    };
    zip.file(`ppt/slides/slide${n}.xml`, slideXml(sl, mediaRid));
    if (sl.notes) {
      rels.push(`<Relationship Id="rId2" Type="${REL('notesSlide')}" Target="../notesSlides/notesSlide${n}.xml"/>`);
      zip.file(`ppt/notesSlides/notesSlide${n}.xml`, notesXml(sl.notes));
      zip.file(`ppt/notesSlides/_rels/notesSlide${n}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL('notesMaster')}" Target="../notesMasters/notesMaster1.xml"/><Relationship Id="rId2" Type="${REL('slide')}" Target="../slides/slide${n}.xml"/></Relationships>`);
      ct = ct.replace('</Types>', `<Override PartName="/ppt/notesSlides/notesSlide${n}.xml" ContentType="${CT.notes}"/></Types>`);
    }
    zip.file(`ppt/slides/_rels/slide${n}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>`);
    ct = ct.replace('</Types>', `<Override PartName="/ppt/slides/slide${n}.xml" ContentType="${CT.slide}"/></Types>`);
    const rid = 'rId' + (++ridN);
    prel = prel.replace('</Relationships>', `<Relationship Id="${rid}" Type="${REL('slide')}" Target="slides/slide${n}.xml"/></Relationships>`);
    sldIds += `<p:sldId id="${256 + i}" r:id="${rid}"/>`;
  });
  for (const ext of usedExt) if (!new RegExp(`Extension="${ext}"`, 'i').test(ct)) ct = ct.replace('<Default ', `<Default Extension="${ext}" ContentType="${IMG_CT[ext] || 'image/' + ext}"/><Default `);
  pres = pres.replace('<p:sldIdLst/>', `<p:sldIdLst>${sldIds}</p:sldIdLst>`);
  zip.file('[Content_Types].xml', ct);
  zip.file('ppt/presentation.xml', pres);
  zip.file('ppt/_rels/presentation.xml.rels', prel);
  let core = await zip.file('docProps/core.xml').async('string');
  core = core.replace(/<dc:title>[^<]*<\/dc:title>|<dc:title\/>/, '').replace('</cp:coreProperties>', `<dc:title>${esc(result.title || '')}</dc:title></cp:coreProperties>`);
  zip.file('docProps/core.xml', core);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', compression: 'DEFLATE' });
}

T.toPptx = toPptx;
})(window);
