import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const assetRoot = path.join(root, "brand/assets");
const svgRoot = path.join(assetRoot, "svg");
const mockupRoot = path.join(assetRoot, "mockups");
const exportRoot = path.join(root, "brand/exports");
const publicRoot = path.join(root, "public");

const C = {
  ink: "#141210",
  inkSoft: "#3A362F",
  paper: "#F7F2E7",
  paperRaised: "#FBF8F2",
  gold: "#C8962F",
  goldDeep: "#9C7220",
  teal: "#1E5B52",
  tealSoft: "#DCE9E6",
  gray: "#8A8277",
  line: "#E7E0D2",
  white: "#FFFFFF",
};

const mkdirs = async (...dirs) => Promise.all(dirs.map((dir) => mkdir(dir, { recursive: true })));
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function mark(x = 0, y = 0, scale = 1, body = C.ink, dot = C.gold) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g fill="${body}"><rect x="13" y="9" width="10" height="46" rx="1.2"/><rect x="13" y="9" width="40" height="10" rx="1.2"/><rect x="13" y="27" width="27" height="10" rx="1.2"/></g><circle cx="55" cy="14" r="7" fill="${dot}"/></g>`;
}

function svg(viewBox, body, extra = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${viewBox.split(" ")[2]}" height="${viewBox.split(" ")[3]}" role="img" ${extra}>${body}</svg>\n`;
}

function symbol(body, dot, label = "FirstIn") {
  return svg("0 0 64 64", `${mark(0, 0, 1, body, dot)}`, `aria-label="${label}"`);
}

function seal(background, foreground, ring = C.ink, label = "FirstIn seal") {
  return svg("0 0 100 100", `<circle cx="50" cy="50" r="47" fill="${background}" stroke="${ring}" stroke-width="2.5"/>${mark(2, 10, 1.3, foreground, C.gold)}`, `aria-label="${label}"`);
}

function favicon() {
  return svg("0 0 64 64", `<rect x="12" y="8" width="13" height="48" rx="2" fill="${C.ink}"/><rect x="12" y="8" width="44" height="13" rx="2" fill="${C.ink}"/><circle cx="58" cy="15" r="9" fill="${C.gold}"/>`, `aria-label="FirstIn"`);
}

function lockup({ dark = false, mono = false, stacked = false, single = false } = {}) {
  const body = dark ? C.paper : C.ink;
  const dot = mono ? body : C.gold;
  const bg = dark ? C.ink : C.paper;
  const color = single ? C.gold : body;
  if (stacked) {
    return svg("0 0 240 220", `<rect width="240" height="220" fill="${bg}"/>${mark(68, 14, 1.7, color, single ? C.gold : dot)}<text x="120" y="178" text-anchor="middle" font-family="Space Grotesk, Avenir Next, Arial, sans-serif" font-weight="600" font-size="38" letter-spacing="-1" fill="${color}">FirstIn</text>`);
  }
  return svg("0 0 440 100", `<rect width="440" height="100" fill="${bg}"/>${mark(8, 15, 1.2, color, single ? C.gold : dot)}<text x="104" y="65" font-family="Space Grotesk, Avenir Next, Arial, sans-serif" font-weight="600" font-size="49" letter-spacing="-1.5" fill="${color}">FirstIn</text>`);
}

function browserChrome(title = "FirstIn") {
  return `<rect width="1440" height="900" fill="${C.paper}"/><rect width="1440" height="40" fill="#E8E2D7"/><circle cx="22" cy="20" r="5" fill="#C9BFB0"/><circle cx="42" cy="20" r="5" fill="#C9BFB0"/><circle cx="62" cy="20" r="5" fill="#C9BFB0"/><rect x="250" y="9" width="940" height="22" rx="11" fill="${C.paperRaised}"/><text x="720" y="24" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="${C.gray}">${title}</text>`;
}

function mockups() {
  const home = svg("0 0 1440 900", `${browserChrome("firstin.app")}<rect y="40" width="1440" height="76" fill="${C.ink}"/>${mark(44, 48, 0.92, C.paper, C.gold)}<text x="108" y="93" font-family="Space Grotesk, Arial, sans-serif" font-size="28" font-weight="600" fill="${C.paper}">FirstIn</text><text x="1120" y="88" font-family="Inter, Arial, sans-serif" font-size="13" fill="${C.paper}">How it works</text><rect x="1242" y="59" width="150" height="40" rx="20" fill="${C.gold}"/><text x="1317" y="84" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600" fill="${C.ink}">Connect wallet</text><text x="82" y="240" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="2" fill="${C.teal}">PROOF OF DISCOVERY · ON MONAD</text><text x="78" y="360" font-family="Fraunces, Georgia, serif" font-size="84" fill="${C.ink}">Discovery,</text><text x="78" y="454" font-family="Fraunces, Georgia, serif" font-size="84" fill="${C.ink}">made visible.</text><text x="82" y="510" font-family="Inter, Arial, sans-serif" font-size="19" fill="${C.inkSoft}">Launch a creator profile. Recognize the first 100 who believed.</text><rect x="82" y="560" width="218" height="58" rx="29" fill="${C.ink}"/><text x="191" y="596" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="15" fill="${C.paper}">Create your profile</text><rect x="318" y="560" width="176" height="58" rx="29" fill="none" stroke="${C.ink}" stroke-width="1.5"/><text x="406" y="596" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="15" fill="${C.ink}">Explore creators</text><circle cx="1110" cy="405" r="172" fill="${C.paperRaised}" stroke="${C.ink}" stroke-width="2"/><circle cx="1110" cy="405" r="145" fill="none" stroke="${C.line}" stroke-width="1"/><circle cx="1110" cy="405" r="112" fill="none" stroke="${C.teal}" stroke-width="1.5"/>${mark(1048, 335, 2, C.ink, C.gold)}<text x="1110" y="500" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.gray}">A PLACE IN THE STORY</text><rect x="82" y="730" width="1276" height="1" fill="${C.line}"/><text x="82" y="774" font-family="Inter, Arial, sans-serif" font-size="14" fill="${C.inkSoft}">80% to the creator</text><circle cx="242" cy="769" r="3" fill="${C.gold}"/><text x="258" y="774" font-family="Inter, Arial, sans-serif" font-size="14" fill="${C.inkSoft}">20% shared with badge holders</text><circle cx="520" cy="769" r="3" fill="${C.gold}"/><text x="536" y="774" font-family="Inter, Arial, sans-serif" font-size="14" fill="${C.inkSoft}">100 badges maximum</text><text x="1358" y="774" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="12" fill="${C.gray}">CONCEPT RENDER</text>`);

  const profile = svg("0 0 1440 900", `${browserChrome("firstin.app/creator-profile")}<rect y="40" width="1440" height="68" fill="${C.ink}"/>${mark(42, 49, 0.76, C.paper, C.gold)}<text x="96" y="88" font-family="Space Grotesk, Arial, sans-serif" font-size="23" font-weight="600" fill="${C.paper}">FirstIn</text><rect x="0" y="108" width="1440" height="192" fill="${C.tealSoft}"/><text x="86" y="176" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="2" fill="${C.teal}">CREATOR PROFILE · MONAD TESTNET</text><circle cx="147" cy="340" r="66" fill="${C.ink}" stroke="${C.paper}" stroke-width="8"/>${mark(109, 310, 0.92, C.paper, C.gold)}<text x="240" y="350" font-family="Fraunces, Georgia, serif" font-size="42" fill="${C.ink}">Maya Okonkwo</text><text x="242" y="384" font-family="IBM Plex Mono, monospace" font-size="14" fill="${C.gray}">@mayaships</text><text x="86" y="468" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="1.5" fill="${C.ink}">EARLY SUPPORTER BADGES</text><rect x="86" y="488" width="540" height="12" rx="6" fill="${C.line}"/><rect x="86" y="488" width="226" height="12" rx="6" fill="${C.gold}"/><text x="86" y="525" font-family="IBM Plex Mono, monospace" font-size="13" fill="${C.gray}">42 / 100 claimed · illustrative data</text><rect x="86" y="564" width="240" height="54" rx="27" fill="${C.ink}"/><text x="206" y="598" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="600" fill="${C.paper}">Claim supporter badge</text><text x="86" y="660" font-family="Inter, Arial, sans-serif" font-size="14" fill="${C.inkSoft}">80% to Maya · 20% shared among badge holders</text><rect x="788" y="346" width="550" height="370" rx="12" fill="${C.paperRaised}" stroke="${C.line}"/><text x="832" y="403" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="1.5" fill="${C.teal}">BACK THE WORK</text><text x="832" y="456" font-family="Fraunces, Georgia, serif" font-size="34" fill="${C.ink}">Send a tip</text><text x="832" y="493" font-family="Inter, Arial, sans-serif" font-size="14" fill="${C.inkSoft}">Your support helps this creator keep making.</text><rect x="832" y="532" width="456" height="54" rx="9" fill="${C.white}" stroke="${C.line}"/><text x="852" y="565" font-family="IBM Plex Mono, monospace" font-size="14" fill="${C.gray}">0.05 MON</text><rect x="832" y="608" width="456" height="54" rx="27" fill="${C.teal}"/><text x="1060" y="642" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="600" fill="${C.white}">Send tip</text><text x="1358" y="848" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="11" fill="${C.gray}">ILLUSTRATIVE CONCEPT · SAMPLE DATA</text>`);

  const badge = svg("0 0 900 700", `<rect width="900" height="700" fill="${C.tealSoft}"/><rect x="256" y="46" width="388" height="608" rx="28" fill="${C.ink}"/><rect x="274" y="64" width="352" height="572" rx="19" fill="none" stroke="${C.gold}" stroke-width="1.5"/><text x="450" y="122" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="3" fill="${C.gray}">EARLY SUPPORTER BADGE</text><circle cx="450" cy="312" r="124" fill="#201D19" stroke="${C.gold}" stroke-width="2"/>${mark(389, 242, 1.95, C.paper, C.gold)}<text x="450" y="492" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="43" fill="${C.paper}">No. 014</text><text x="450" y="526" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="13" fill="${C.gray}">@mayaships</text><line x1="316" y1="558" x2="584" y2="558" stroke="${C.inkSoft}"/><text x="450" y="594" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="11" fill="${C.gray}">PROOF OF DISCOVERY · MONAD</text><text x="450" y="680" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="10" fill="${C.inkSoft}">CONCEPT BADGE · SERIAL IS ILLUSTRATIVE</text>`);

  const dashboard = svg("0 0 1440 900", `${browserChrome("firstin.app/creator")}<rect y="40" width="1440" height="860" fill="${C.paperRaised}"/><rect y="40" width="252" height="860" fill="${C.ink}"/>${mark(34, 64, 0.75, C.paper, C.gold)}<text x="89" y="101" font-family="Space Grotesk, Arial, sans-serif" font-size="22" font-weight="600" fill="${C.paper}">FirstIn</text><text x="34" y="166" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.7" fill="${C.gray}">CREATOR SPACE</text><rect x="21" y="188" width="210" height="43" rx="8" fill="#292620"/><circle cx="42" cy="209" r="3" fill="${C.gold}"/><text x="57" y="214" font-family="Inter, Arial, sans-serif" font-size="13" fill="${C.paper}">Overview</text><text x="57" y="260" font-family="Inter, Arial, sans-serif" font-size="13" fill="${C.gray}">Your profile</text><text x="57" y="306" font-family="Inter, Arial, sans-serif" font-size="13" fill="${C.gray}">Supporters</text><text x="57" y="352" font-family="Inter, Arial, sans-serif" font-size="13" fill="${C.gray}">Revenue</text><text x="300" y="118" font-family="Fraunces, Georgia, serif" font-size="36" fill="${C.ink}">Your early circle.</text><text x="302" y="150" font-family="Inter, Arial, sans-serif" font-size="13" fill="${C.gray}">A clear view of the people who found you first.</text><rect x="300" y="190" width="286" height="150" rx="12" fill="${C.white}" stroke="${C.line}"/><text x="326" y="228" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.5" fill="${C.gray}">BADGES CLAIMED</text><text x="326" y="289" font-family="Space Grotesk, Arial, sans-serif" font-weight="600" font-size="45" fill="${C.ink}">42<tspan font-size="23" fill="${C.gray}"> / 100</tspan></text><rect x="622" y="190" width="510" height="150" rx="12" fill="${C.white}" stroke="${C.line}"/><text x="650" y="228" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.5" fill="${C.gray}">TIP SPLIT</text><rect x="650" y="258" width="440" height="16" rx="8" fill="${C.tealSoft}"/><path d="M658 258h336v16H658a8 8 0 0 1 0-16" fill="${C.gold}"/><text x="650" y="306" font-family="Inter, Arial, sans-serif" font-size="12" fill="${C.inkSoft}">80% creator</text><text x="1090" y="306" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="12" fill="${C.teal}">20% supporters</text><rect x="1168" y="190" width="238" height="150" rx="12" fill="${C.ink}"/><text x="1194" y="228" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.5" fill="${C.gray}">PENDING TIPS</text><text x="1194" y="282" font-family="Space Grotesk, Arial, sans-serif" font-weight="600" font-size="31" fill="${C.paper}">1.24 MON</text><text x="1194" y="311" font-family="Inter, Arial, sans-serif" font-size="11" fill="${C.gold}">Ready to distribute</text><rect x="300" y="376" width="1106" height="350" rx="12" fill="${C.white}" stroke="${C.line}"/><text x="328" y="418" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="1.3" fill="${C.ink}">RECENT SUPPORTERS</text><text x="328" y="472" font-family="IBM Plex Mono, monospace" font-size="13" fill="${C.inkSoft}">0x9F2…A41</text><text x="764" y="472" font-family="Inter, Arial, sans-serif" font-size="12" fill="${C.gray}">Early supporter</text><text x="1348" y="472" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.gray}">CLAIMED</text><line x1="328" y1="495" x2="1376" y2="495" stroke="${C.line}"/><text x="328" y="536" font-family="IBM Plex Mono, monospace" font-size="13" fill="${C.inkSoft}">0x1B7…E09</text><text x="764" y="536" font-family="Inter, Arial, sans-serif" font-size="12" fill="${C.gray}">Early supporter</text><text x="1348" y="536" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.gray}">CLAIMED</text><text x="328" y="690" font-family="Inter, Arial, sans-serif" font-size="10" fill="${C.gray}">CONCEPT RENDER · SAMPLE DATA</text>`);

  const social = svg("0 0 1650 630", `<rect width="400" height="400" rx="200" fill="${C.ink}"/><circle cx="200" cy="200" r="174" fill="none" stroke="${C.gold}" stroke-width="2"/>${mark(130, 130, 2.2, C.paper, C.gold)}<text x="200" y="370" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.5" fill="${C.gray}">PROFILE AVATAR</text><rect x="440" width="1210" height="630" rx="16" fill="${C.ink}"/><circle cx="1510" cy="120" r="130" fill="none" stroke="#292620" stroke-width="1"/><circle cx="1510" cy="120" r="98" fill="none" stroke="#292620" stroke-width="1"/><text x="510" y="242" font-family="Fraunces, Georgia, serif" font-size="72" fill="${C.paper}">I was #07.</text><text x="514" y="300" font-family="Inter, Arial, sans-serif" font-size="20" fill="${C.gray}">Proof of discovery, recorded on Monad.</text>${mark(514, 348, 0.9, C.paper, C.gold)}<text x="578" y="394" font-family="Space Grotesk, Arial, sans-serif" font-weight="600" font-size="28" fill="${C.paper}">FirstIn</text><text x="578" y="422" font-family="IBM Plex Mono, monospace" font-size="11" fill="${C.gray}">FIRSTIN.APP · SAMPLE SOCIAL CARD</text>`);

  const cards = svg("0 0 1160 620", `<rect width="1160" height="620" fill="${C.tealSoft}"/><rect x="72" y="72" width="480" height="280" rx="4" fill="${C.ink}"/><rect x="608" y="72" width="480" height="280" rx="4" fill="${C.paper}" stroke="${C.line}"/><rect x="82" y="82" width="460" height="260" rx="2" fill="none" stroke="#3A362F"/><circle cx="152" cy="186" r="43" fill="${C.inkSoft}"/>${mark(124, 158, 0.9, C.paper, C.gold)}<text x="218" y="176" font-family="Space Grotesk, Arial, sans-serif" font-weight="600" font-size="34" fill="${C.paper}">FirstIn</text><text x="220" y="204" font-family="Inter, Arial, sans-serif" font-size="14" fill="${C.gray}">Proof of discovery, on Monad</text><line x1="112" y1="270" x2="512" y2="270" stroke="#3A362F"/><text x="112" y="308" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.gold}">BE FIRST. BE KNOWN.</text>${mark(820, 106, 0.82, C.ink, C.gold)}<text x="702" y="222" font-family="Fraunces, Georgia, serif" font-size="28" fill="${C.ink}">Discovery, made visible.</text><text x="702" y="256" font-family="Inter, Arial, sans-serif" font-size="13" fill="${C.inkSoft}">FirstIn · Monad</text><text x="702" y="310" font-family="IBM Plex Mono, monospace" font-size="10" fill="${C.gray}">FOUNDING TEAM · CONCEPT CARD</text><text x="72" y="410" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="1.3" fill="${C.teal}">89 × 51 MM · FRONT AND BACK</text>`);

  const signage = svg("0 0 1000 1800", `<rect width="1000" height="1800" fill="${C.ink}"/><rect x="38" y="38" width="924" height="1724" fill="none" stroke="#3A362F" stroke-width="1"/>${mark(417, 202, 2.6, C.paper, C.gold)}<text x="500" y="480" text-anchor="middle" font-family="Space Grotesk, Arial, sans-serif" font-weight="600" font-size="52" fill="${C.paper}">FirstIn</text><text x="500" y="800" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="68" fill="${C.paper}">Be first.</text><text x="500" y="886" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="68" fill="${C.gold}">Be known.</text><line x1="280" y1="950" x2="720" y2="950" stroke="#3A362F"/><text x="500" y="1040" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="19" fill="${C.gray}">Proof of discovery, on Monad</text><text x="500" y="1610" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="16" fill="${C.gray}">SOCIAL · ATTENTION · CULTURE</text><text x="500" y="1680" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="12" fill="${C.gray}">EVENT SIGNAGE · CONCEPT RENDER</text>`);

  const packaging = svg("0 0 1200 820", `<rect width="1200" height="820" fill="${C.tealSoft}"/><ellipse cx="602" cy="660" rx="360" ry="54" fill="#C5D8D4"/><g transform="translate(260 90) rotate(-4 300 300)"><rect x="40" y="40" width="540" height="530" rx="12" fill="${C.paper}" stroke="${C.ink}" stroke-width="2"/><rect x="62" y="62" width="496" height="486" fill="none" stroke="${C.line}"/><circle cx="310" cy="248" r="124" fill="${C.paperRaised}" stroke="${C.ink}" stroke-width="2"/><circle cx="310" cy="248" r="98" fill="none" stroke="${C.teal}" stroke-width="1.5"/>${mark(249, 178, 1.95, C.ink, C.gold)}<text x="310" y="426" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="1.5" fill="${C.teal}">EARLY SUPPORTER</text><text x="310" y="472" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="30" fill="${C.ink}">Proof you were here first.</text><text x="310" y="520" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="10" fill="${C.gray}">BADGE MAILER · CONCEPT PACKAGING</text></g><rect x="850" y="202" width="202" height="294" rx="14" fill="${C.ink}"/><rect x="862" y="214" width="178" height="270" rx="9" fill="none" stroke="${C.gold}" stroke-width="1"/>${mark(910, 278, 1.1, C.paper, C.gold)}<text x="951" y="376" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="23" fill="${C.paper}">No. 014</text><text x="951" y="410" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="${C.gray}">ILLUSTRATIVE</text><text x="951" y="454" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="9" fill="${C.gray}">DIGITAL BADGE</text>`);

  const storefront = svg("0 0 1200 800", `<rect width="1200" height="800" fill="${C.tealSoft}"/><circle cx="1010" cy="130" r="54" fill="${C.paper}"/><rect y="610" width="1200" height="190" fill="#C6BFB4"/><path d="M180 310h840v330H180z" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/><path d="M150 230h900v80H150z" fill="${C.ink}"/><path d="M160 230h880v70H160z" fill="${C.ink}"/>${mark(432, 236, 0.86, C.paper, C.gold)}<text x="510" y="286" font-family="Space Grotesk, Arial, sans-serif" font-weight="600" font-size="30" fill="${C.paper}">FirstIn</text><rect x="228" y="362" width="744" height="230" fill="${C.paperRaised}" stroke="${C.line}"/><rect x="242" y="378" width="270" height="214" fill="${C.tealSoft}"/><rect x="530" y="378" width="426" height="214" fill="${C.paper}"/><text x="560" y="430" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1" fill="${C.teal}">PROOF OF DISCOVERY</text><text x="560" y="478" font-family="Fraunces, Georgia, serif" font-size="30" fill="${C.ink}">Be first.</text><text x="560" y="514" font-family="Fraunces, Georgia, serif" font-size="30" fill="${C.ink}">Be known.</text><text x="560" y="556" font-family="Inter, Arial, sans-serif" font-size="12" fill="${C.inkSoft}">Creators and their earliest supporters.</text><rect x="228" y="640" width="160" height="160" fill="${C.ink}"/><rect x="812" y="640" width="160" height="160" fill="${C.ink}"/><text x="600" y="760" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="${C.inkSoft}">STOREFRONT CONCEPT · NOT A PHYSICAL RETAIL LOCATION</text>`);

  const billboard = svg("0 0 1600 900", `<rect width="1600" height="900" fill="#DED8CD"/><rect x="244" y="94" width="1112" height="584" rx="5" fill="${C.ink}"/><rect x="264" y="114" width="1072" height="544" fill="none" stroke="#3A362F"/><rect x="700" y="678" width="38" height="186" fill="#777066"/><rect x="864" y="678" width="38" height="186" fill="#777066"/>${mark(742, 168, 1.85, C.paper, C.gold)}<text x="800" y="352" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="56" fill="${C.paper}">Early is a position.</text><text x="800" y="426" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="56" fill="${C.gold}">Not a promise.</text><text x="800" y="496" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" fill="${C.gray}">FirstIn · Proof of discovery, on Monad</text><text x="800" y="590" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="2" fill="${C.gray}">BILLBOARD CONCEPT</text>`);

  return {
    "01-website-home.svg": home,
    "02-creator-profile.svg": profile,
    "03-badge-collectible.svg": badge,
    "04-creator-dashboard.svg": dashboard,
    "05-social-avatar-og.svg": social,
    "06-business-cards.svg": cards,
    "07-event-signage.svg": signage,
    "08-badge-packaging.svg": packaging,
    "09-storefront.svg": storefront,
    "10-billboard.svg": billboard,
  };
}

function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map((entry) => {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(entry.size === 256 ? 0 : entry.size, 0);
    dir.writeUInt8(entry.size === 256 ? 0 : entry.size, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(entry.png.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += entry.png.length;
    return dir;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((entry) => entry.png)]);
}

await mkdirs(
  path.join(svgRoot, "symbol"), path.join(svgRoot, "lockups"), path.join(svgRoot, "favicon"),
  mockupRoot, path.join(exportRoot, "png"), path.join(exportRoot, "mockups"),
  path.join(publicRoot, "brand"), path.join(publicRoot, "icons"), path.join(publicRoot, "og"),
);

const symbols = {
  "symbol-color-onlight.svg": symbol(C.ink, C.gold),
  "symbol-color-ondark.svg": symbol(C.paper, C.gold),
  "symbol-mono-black.svg": symbol(C.ink, C.ink),
  "symbol-mono-white.svg": symbol(C.white, C.white),
  "symbol-single-gold.svg": symbol(C.gold, C.gold),
  "symbol-seal-color.svg": seal(C.paper, C.ink),
  "symbol-seal-ondark.svg": seal(C.ink, C.paper, C.paper),
};
const faviconSvg = favicon();
for (const [name, source] of Object.entries(symbols)) {
  await writeFile(path.join(svgRoot, "symbol", name), source);
}
await writeFile(path.join(svgRoot, "favicon", "favicon-simplified.svg"), faviconSvg);

const lockups = {
  "horizontal-color-onlight.svg": lockup(),
  "horizontal-color-ondark.svg": lockup({ dark: true }),
  "horizontal-mono-black.svg": lockup({ mono: true }),
  "horizontal-mono-white.svg": lockup({ dark: true, mono: true }),
  "horizontal-single-gold.svg": lockup({ single: true }),
  "stacked-color-onlight.svg": lockup({ stacked: true }),
  "stacked-color-ondark.svg": lockup({ dark: true, stacked: true }),
  "stacked-mono-black.svg": lockup({ mono: true, stacked: true }),
  "stacked-mono-white.svg": lockup({ dark: true, mono: true, stacked: true }),
  "stacked-single-gold.svg": lockup({ single: true, stacked: true }),
};
for (const [name, source] of Object.entries(lockups)) {
  await writeFile(path.join(svgRoot, "lockups", name), source);
}

const mockupFiles = mockups();
for (const [name, source] of Object.entries(mockupFiles)) {
  await writeFile(path.join(mockupRoot, name), source);
  const match = source.match(/viewBox="0 0 (\d+) (\d+)"/);
  const width = Number(match[1]);
  const height = Number(match[2]);
  await sharp(Buffer.from(source)).resize({ width, height, withoutEnlargement: true }).png().toFile(path.join(exportRoot, "mockups", name.replace(/\.svg$/, ".png")));
}

const exportSizes = [16, 32, 48, 64, 128, 180, 192, 256, 512, 1024];
const faviconPngs = [];
for (const size of exportSizes) {
  const buffer = await sharp(Buffer.from(faviconSvg)).resize(size, size).png().toBuffer();
  await writeFile(path.join(exportRoot, "png", `favicon-${size}.png`), buffer);
  if ([16, 32, 48].includes(size)) faviconPngs.push({ size, png: buffer });
}
for (const size of [64, 128, 180, 192, 256, 512, 1024]) {
  const buffer = await sharp(Buffer.from(symbols["symbol-seal-color.svg"])).resize(size, size).png().toBuffer();
  await writeFile(path.join(exportRoot, "png", `seal-${size}.png`), buffer);
}

const icoBuffer = ico(faviconPngs);
await writeFile(path.join(exportRoot, "favicon.ico"), icoBuffer);
await writeFile(path.join(publicRoot, "favicon.ico"), icoBuffer);
await writeFile(path.join(publicRoot, "brand", "symbol-color-onlight.svg"), symbols["symbol-color-onlight.svg"]);
await writeFile(path.join(publicRoot, "brand", "symbol-color-ondark.svg"), symbols["symbol-color-ondark.svg"]);
await writeFile(path.join(publicRoot, "brand", "symbol-seal-color.svg"), symbols["symbol-seal-color.svg"]);
await writeFile(path.join(publicRoot, "brand", "horizontal-color-onlight.svg"), lockups["horizontal-color-onlight.svg"]);
await writeFile(path.join(publicRoot, "brand", "horizontal-color-ondark.svg"), lockups["horizontal-color-ondark.svg"]);
await writeFile(path.join(publicRoot, "brand", "favicon-simplified.svg"), faviconSvg);

const appleIcon = await sharp(Buffer.from(symbols["symbol-seal-color.svg"])).resize(180, 180).png().toBuffer();
const pwa192 = await sharp(Buffer.from(symbols["symbol-seal-color.svg"])).resize(192, 192).png().toBuffer();
const pwa512 = await sharp(Buffer.from(symbols["symbol-seal-color.svg"])).resize(512, 512).png().toBuffer();
const og = await sharp(Buffer.from(mockupFiles["05-social-avatar-og.svg"]))
  .extract({ left: 440, top: 0, width: 1210, height: 630 })
  .png().toBuffer();
await writeFile(path.join(publicRoot, "apple-touch-icon.png"), appleIcon);
await writeFile(path.join(publicRoot, "icons", "icon-192.png"), pwa192);
await writeFile(path.join(publicRoot, "icons", "icon-512.png"), pwa512);
await writeFile(path.join(publicRoot, "og", "firstin-default.png"), og);
await writeFile(path.join(publicRoot, "site.webmanifest"), `${JSON.stringify({
  name: "FirstIn — Proof of Discovery",
  short_name: "FirstIn",
  description: "Discovery, made visible.",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
  theme_color: C.ink,
  background_color: C.paper,
  display: "standalone",
}, null, 2)}\n`);

console.log(`Generated ${Object.keys(symbols).length} symbol/seal SVGs, ${Object.keys(lockups).length} lockups, ${Object.keys(mockupFiles).length} SVG+PNG mockups, favicon, PWA icons, and social preview.`);
