import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runInitSql() {
  const candidates = [
    path.resolve("/app/init.sql"),
    path.resolve(process.cwd(), "../../init.sql"),
    path.resolve(process.cwd(), "init.sql"),
  ];
  const sqlFile = candidates.find((f) => fs.existsSync(f));
  if (!sqlFile) {
    logger.info("init.sql not found — skipping DB init");
    return;
  }
  try {
    const sql = fs.readFileSync(sqlFile, "utf8");
    await pool.query(sql);
    logger.info({ file: sqlFile }, "DB initialised via init.sql");
  } catch (err) {
    logger.error({ err }, "init.sql execution failed");
  }
}

async function seedCategoriesAndServices() {
  try {
    // ── Categories ───────────────────────────────────────────────────────────
    const categories = [
      { nameFr: "Impression grand format", nameAr: "الطباعة كبيرة الحجم", slug: "impression-grand-format", descFr: "Solutions d'impression grand format pour supports publicitaires, affichage promotionnel et communication visuelle intérieure et extérieure.", descAr: "حلول الطباعة كبيرة الحجم للدعامات الإشهارية والعروض البصرية الداخلية والخارجية.", order: 1 },
      { nameFr: "Enseignes & signalétique", nameAr: "اللافتات والإرشادات", slug: "enseignes-signaletique", descFr: "Fabrication d'enseignes, de signalétique intérieure et extérieure, et de supports d'orientation pour commerces, entreprises et chantiers.", descAr: "تصميم وإنجاز اللافتات والإشارات الداخلية والخارجية ودعامات التوجيه للمحلات والشركات وورشات البناء.", order: 2 },
      { nameFr: "Bâches publicitaires", nameAr: "اللافتات القماشية الإشهارية", slug: "baches-publicitaires", descFr: "Impression et fabrication de bâches publicitaires pour événements, promotions, façades commerciales et chantiers.", descAr: "طباعة وتصنيع اللافتات القماشية الإشهارية للفعاليات والعروض والواجهات التجارية وورشات البناء.", order: 3 },
      { nameFr: "Impression papier", nameAr: "الطباعة الورقية", slug: "impression-papier", descFr: "Impression de supports papier pour la communication commerciale, promotionnelle et institutionnelle.", descAr: "طباعة مختلف الدعامات الورقية المخصصة للتواصل التجاري والإشهاري والمؤسساتي.", order: 4 },
      { nameFr: "Stickers & adhésifs", nameAr: "الملصقات واللاصق الإشهاري", slug: "stickers-adhesifs", descFr: "Création et impression de stickers, vinyles adhésifs et solutions de marquage pour vitrines, murs, véhicules et surfaces diverses.", descAr: "تصميم وطباعة الملصقات والفينيل اللاصق وحلول التلصيق للواجهات والجدران والمركبات ومختلف الأسطح.", order: 5 },
      { nameFr: "Panneaux & plaques", nameAr: "اللوحات والصفائح", slug: "panneaux-plaques", descFr: "Fabrication de panneaux publicitaires, panneaux signalétiques et plaques professionnelles sur différents supports rigides.", descAr: "تصنيع اللوحات الإشهارية ولوحات التوجيه والصفائح المهنية على مختلف الدعامات الصلبة.", order: 6 },
      { nameFr: "PLV & affichage événementiel", nameAr: "وسائل العرض والإشهار للفعاليات", slug: "plv-affichage-evenementiel", descFr: "Supports de communication visuelle pour points de vente, salons, expositions et événements promotionnels.", descAr: "وسائل العرض والتواصل البصري لنقاط البيع والمعارض والفعاليات الترويجية.", order: 7 },
      { nameFr: "Impression UV sur supports rigides", nameAr: "الطباعة بالأشعة فوق البنفسجية على الدعامات الصلبة", slug: "impression-uv-supports-rigides", descFr: "Impression UV haute qualité sur supports rigides pour signalétique, décoration, habillage et communication visuelle durable.", descAr: "طباعة UV عالية الجودة على الدعامات الصلبة من أجل الإرشاد والديكور والتغليف والتواصل البصري الدائم.", order: 8 },
    ];

    for (const cat of categories) {
      await pool.query(
        `INSERT INTO service_categories (name_fr, name_ar, slug, description_fr, description_ar, is_active, display_order)
         VALUES ($1,$2,$3,$4,$5,true,$6)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.nameFr, cat.nameAr, cat.slug, cat.descFr, cat.descAr, cat.order],
      );
    }

    // ── Services per category ─────────────────────────────────────────────────
    const servicesByCatSlug: Record<string, Array<{ nameFr: string; nameAr: string; slug: string; descFr: string; descAr: string; pub: number; cli: number; sub: number }>> = {
      "impression-grand-format": [
        { nameFr: "Impression bâche UV", nameAr: "طباعة بانيرو UV", slug: "bache-uv", descFr: "Impression UV haute résolution sur bâche intérieure ou extérieure.", descAr: "طباعة UV عالية الدقة على البانيرو الداخلي أو الخارجي.", pub: 4200, cli: 3500, sub: 2200 },
        { nameFr: "Impression bâche éco-solvant", nameAr: "طباعة بانيرو بالحبر البيئي", slug: "bache-eco-solvant", descFr: "Impression éco-solvant sur bâche grand format, idéale pour l'extérieur.", descAr: "طباعة بيئية على البانيرو كبير الحجم مثالية للاستخدام الخارجي.", pub: 3800, cli: 3100, sub: 1900 },
        { nameFr: "Impression affiches grand format", nameAr: "طباعة ملصقات كبيرة الحجم", slug: "affiches-grand-format", descFr: "Affiches promotionnelles grand format pour vitrines, salons et points de vente.", descAr: "ملصقات ترويجية كبيرة الحجم للواجهات والمعارض ونقاط البيع.", pub: 5000, cli: 4000, sub: 2500 },
        { nameFr: "Impression toile canvas", nameAr: "طباعة على قماش الكانفاس", slug: "toile-canvas", descFr: "Impression sur toile canvas tendue pour décoration intérieure haut de gamme.", descAr: "طباعة على قماش الكانفاس المشدود للديكور الداخلي الراقي.", pub: 6500, cli: 5200, sub: 3200 },
        { nameFr: "Impression visuels roll-up", nameAr: "طباعة لوحات رول أب", slug: "roll-up-visuels", descFr: "Visuels haute qualité pour roll-up banner et kakemono.", descAr: "مطبوعات عالية الجودة لدعامات الرول أب والكاكيمونو.", pub: 4800, cli: 3800, sub: 2400 },
        { nameFr: "Impression papier photo grand format", nameAr: "طباعة صور فوتوغرافية كبيرة الحجم", slug: "papier-photo-grand-format", descFr: "Impression photo grand format sur papier brillant ou satiné, idéale pour l'exposition.", descAr: "طباعة صور كبيرة الحجم على ورق لامع أو مطفي مثالية للعرض.", pub: 7000, cli: 5500, sub: 3500 },
      ],
      "enseignes-signaletique": [
        { nameFr: "Enseigne lumineuse", nameAr: "لافتة مضيئة", slug: "enseigne-lumineuse", descFr: "Enseignes lumineuses LED pour commerces et entreprises, visibles jour et nuit.", descAr: "لافتات مضيئة بإضاءة LED للمحلات والشركات مرئية ليلاً ونهاراً.", pub: 12000, cli: 9500, sub: 6000 },
        { nameFr: "Enseigne non lumineuse", nameAr: "لافتة غير مضيئة", slug: "enseigne-non-lumineuse", descFr: "Enseignes classiques en aluminium, PVC ou composite pour tout commerce.", descAr: "لافتات كلاسيكية من الألومنيوم أو PVC أو المركّب لجميع المحلات.", pub: 7500, cli: 6000, sub: 3800 },
        { nameFr: "Caisson lumineux", nameAr: "صندوق إضاءة", slug: "caisson-lumineux", descFr: "Caissons lumineux rétroéclairés pour affichage commercial intérieur et extérieur.", descAr: "صناديق إضاءة خلفية للعرض التجاري الداخلي والخارجي.", pub: 9500, cli: 7800, sub: 4800 },
        { nameFr: "Lettres découpées", nameAr: "حروف مقطوعة", slug: "lettres-decoupees", descFr: "Lettres découpées en PVC, aluminium ou inox pour enseignes et façades.", descAr: "حروف مقطوعة من PVC أو ألومنيوم أو الفولاذ المقاوم للصدأ للافتات والواجهات.", pub: 8500, cli: 6800, sub: 4200 },
        { nameFr: "Signalétique intérieure", nameAr: "إشارات داخلية", slug: "signaletique-interieure", descFr: "Systèmes de signalétique intérieure pour bureaux, hôpitaux, hôtels et centres commerciaux.", descAr: "أنظمة الإشارات الداخلية للمكاتب والمستشفيات والفنادق والمراكز التجارية.", pub: 6000, cli: 4800, sub: 3000 },
        { nameFr: "Signalétique extérieure", nameAr: "إشارات خارجية", slug: "signaletique-exterieure", descFr: "Supports de signalétique extérieure résistants aux intempéries pour tous sites.", descAr: "دعامات الإشارات الخارجية المقاومة للطقس لجميع المواقع.", pub: 7000, cli: 5600, sub: 3500 },
        { nameFr: "Plaque professionnelle", nameAr: "لوحة مهنية", slug: "plaque-professionnelle", descFr: "Plaques d'identification professionnelle en aluminium brossé, plexiglass ou inox.", descAr: "لوحات تعريفية مهنية من الألومنيوم المصقول أو البلاكسيغلاس أو الفولاذ المقاوم.", pub: 4500, cli: 3600, sub: 2200 },
        { nameFr: "Panneau de chantier", nameAr: "لوحة ورشة بناء", slug: "panneau-chantier", descFr: "Panneaux réglementaires pour chantiers de construction et travaux publics.", descAr: "لوحات إجبارية لورشات البناء والأشغال العامة.", pub: 5500, cli: 4400, sub: 2700 },
      ],
      "baches-publicitaires": [
        { nameFr: "Bâche publicitaire UV", nameAr: "بانيرو إشهاري UV", slug: "bache-pub-uv", descFr: "Bâche publicitaire imprimée en UV, haute définition, résistante aux UV.", descAr: "بانيرو إشهاري مطبوع بـ UV بجودة عالية ومقاوم للأشعة فوق البنفسجية.", pub: 4000, cli: 3200, sub: 2000 },
        { nameFr: "Bâche publicitaire éco-solvant", nameAr: "بانيرو إشهاري بيئي", slug: "bache-pub-eco-solvant", descFr: "Bâche grand format imprimée en éco-solvant, résistante aux intempéries.", descAr: "بانيرو كبير الحجم مطبوع بيئياً ومقاوم للطقس.", pub: 3600, cli: 2900, sub: 1800 },
        { nameFr: "Bâche de façade", nameAr: "بانيرو واجهة", slug: "bache-facade", descFr: "Bâche grand format pour habillage de façades commerciales et immeubles.", descAr: "بانيرو كبير الحجم لتغطية الواجهات التجارية والعمارات.", pub: 3800, cli: 3000, sub: 1900 },
        { nameFr: "Bâche de chantier", nameAr: "بانيرو ورشة بناء", slug: "bache-chantier", descFr: "Bâche microperforée ou pleine pour clôtures de chantier et palissades.", descAr: "بانيرو مثقوب أو كامل لأسوار ورشات البناء.", pub: 3500, cli: 2800, sub: 1700 },
        { nameFr: "Kakemono", nameAr: "كاكيمونو", slug: "kakemono", descFr: "Kakemono enrouleur pour salons, conférences et points de vente.", descAr: "كاكيمونو قابل للطي للمعارض والمؤتمرات ونقاط البيع.", pub: 5500, cli: 4400, sub: 2700 },
        { nameFr: "Roll-up banner", nameAr: "رول أب باينر", slug: "roll-up-banner", descFr: "Roll-up banner standard ou premium pour présentations commerciales.", descAr: "رول أب باينر عادي أو فاخر للعروض التجارية.", pub: 5000, cli: 4000, sub: 2500 },
        { nameFr: "X-banner", nameAr: "إكس باينر", slug: "x-banner", descFr: "X-banner économique et léger pour expositions et événements.", descAr: "إكس باينر اقتصادي وخفيف الوزن للمعارض والفعاليات.", pub: 3800, cli: 3000, sub: 1900 },
        { nameFr: "Beach flag", nameAr: "بيتش فلاغ", slug: "beach-flag", descFr: "Drapeau beach flag haute visibilité pour extérieur, résistant au vent.", descAr: "علم بيتش فلاغ عالي الرؤية للاستخدام الخارجي مقاوم للرياح.", pub: 6000, cli: 4800, sub: 3000 },
      ],
      "impression-papier": [
        { nameFr: "Cartes de visite", nameAr: "بطاقات الأعمال", slug: "cartes-visite", descFr: "Cartes de visite professionnelles sur différents supports papier.", descAr: "بطاقات أعمال احترافية على مختلف أنواع الورق.", pub: 2500, cli: 2000, sub: 1200 },
        { nameFr: "Flyers", nameAr: "فلايرز ترويجية", slug: "flyers", descFr: "Flyers promotionnels A4, A5 ou format personnalisé pour toutes occasions.", descAr: "فلايرز ترويجية بأحجام A4 وA5 أو مخصصة لجميع المناسبات.", pub: 2200, cli: 1800, sub: 1100 },
        { nameFr: "Dépliants", nameAr: "بروشورات مطوية", slug: "depliants", descFr: "Dépliants 2 ou 3 volets pour présentation de produits et services.", descAr: "بروشورات مطوية على 2 أو 3 أجزاء لتقديم المنتجات والخدمات.", pub: 2800, cli: 2200, sub: 1400 },
        { nameFr: "Brochures", nameAr: "كتيبات", slug: "brochures", descFr: "Brochures multi-pages pour catalogues, rapports et présentations d'entreprise.", descAr: "كتيبات متعددة الصفحات للفهارس والتقارير وعروض الشركات.", pub: 3500, cli: 2800, sub: 1700 },
        { nameFr: "Affiches", nameAr: "ملصقات", slug: "affiches-papier", descFr: "Affiches papier pour événements, promotions et communication interne.", descAr: "ملصقات ورقية للفعاليات والعروض والتواصل الداخلي.", pub: 3000, cli: 2400, sub: 1500 },
        { nameFr: "Menus", nameAr: "قوائم الطعام", slug: "menus", descFr: "Menus de restaurant, café et hôtel en différents formats et finitions.", descAr: "قوائم طعام للمطاعم والمقاهي والفنادق بأشكال وتشطيبات مختلفة.", pub: 3200, cli: 2600, sub: 1600 },
        { nameFr: "Enveloppes imprimées", nameAr: "أظرف مطبوعة", slug: "enveloppes-imprimees", descFr: "Enveloppes personnalisées avec logo et coordonnées pour correspondance professionnelle.", descAr: "أظرف مخصصة بالشعار والمعلومات للمراسلات المهنية.", pub: 2000, cli: 1600, sub: 1000 },
        { nameFr: "Cartes de fidélité", nameAr: "بطاقات الولاء", slug: "cartes-fidelite", descFr: "Cartes de fidélité plastifiées ou cartonnées pour commerces et restaurants.", descAr: "بطاقات ولاء مغطاة بالبلاستيك أو الكرتون للمحلات والمطاعم.", pub: 2300, cli: 1900, sub: 1150 },
      ],
      "stickers-adhesifs": [
        { nameFr: "Sticker vitrine", nameAr: "ملصق واجهة زجاجية", slug: "sticker-vitrine", descFr: "Stickers adhésifs pour décoration et communication sur vitrines.", descAr: "ملصقات لاصقة لتزيين وإشهار الواجهات الزجاجية.", pub: 4500, cli: 3600, sub: 2200 },
        { nameFr: "Sticker mural", nameAr: "ملصق جداري", slug: "sticker-mural", descFr: "Stickers muraux décoratifs ou publicitaires pour intérieurs.", descAr: "ملصقات جدارية زخرفية أو إشهارية للمساحات الداخلية.", pub: 4200, cli: 3400, sub: 2100 },
        { nameFr: "Vinyle adhésif imprimé", nameAr: "فينيل لاصق مطبوع", slug: "vinyle-adhesif-imprime", descFr: "Vinyle adhésif imprimé haute résolution pour marquage et décoration.", descAr: "فينيل لاصق مطبوع بدقة عالية للتعليم والتزيين.", pub: 5000, cli: 4000, sub: 2500 },
        { nameFr: "Vinyle découpé", nameAr: "فينيل مقطوع", slug: "vinyle-decoupe", descFr: "Vinyle découpé en formes ou lettres pour vitrines et véhicules.", descAr: "فينيل مقطوع بأشكال أو حروف للواجهات والمركبات.", pub: 4800, cli: 3800, sub: 2400 },
        { nameFr: "Vitrophanie", nameAr: "ملصق زجاجي قابل للإزالة", slug: "vitrophanie", descFr: "Vitrophanie électrostatique ou adhésive, réutilisable ou permanente.", descAr: "ملصق زجاجي إلكتروستاتيكي أو لاصق قابل لإعادة الاستخدام أو دائم.", pub: 4600, cli: 3700, sub: 2300 },
        { nameFr: "Film microperforé", nameAr: "فيلم مثقوب دقيق", slug: "film-microperfore", descFr: "Film microperforé pour vitrines, permet la visibilité depuis l'intérieur.", descAr: "فيلم مثقوب دقيق للواجهات يسمح بالرؤية من الداخل.", pub: 5500, cli: 4400, sub: 2700 },
        { nameFr: "Habillage vitrine", nameAr: "تغليف الواجهة الزجاجية", slug: "habillage-vitrine", descFr: "Habillage complet de vitrine avec vinyle imprimé ou découpé.", descAr: "تغليف كامل للواجهة الزجاجية بفينيل مطبوع أو مقطوع.", pub: 6000, cli: 4800, sub: 3000 },
        { nameFr: "Habillage véhicule", nameAr: "تغليف المركبات", slug: "habillage-vehicule", descFr: "Covering total ou partiel de véhicules utilitaires et commerciaux.", descAr: "تغليف كلي أو جزئي للمركبات الخدمية والتجارية.", pub: 8000, cli: 6400, sub: 4000 },
      ],
      "panneaux-plaques": [
        { nameFr: "Panneau PVC", nameAr: "لوحة PVC", slug: "panneau-pvc", descFr: "Panneaux PVC expansé léger et résistant pour signalétique et affichage.", descAr: "لوحات PVC منتفخة خفيفة ومتينة للتوجيه والإشهار.", pub: 4500, cli: 3600, sub: 2200 },
        { nameFr: "Panneau forex", nameAr: "لوحة فوريكس", slug: "panneau-forex", descFr: "Panneaux forex rigides pour signalétique intérieure et extérieure.", descAr: "لوحات فوريكس صلبة للتوجيه الداخلي والخارجي.", pub: 5000, cli: 4000, sub: 2500 },
        { nameFr: "Panneau aluminium composite", nameAr: "لوحة ألومنيوم مركّب", slug: "panneau-aluminium-composite", descFr: "Panneaux aluminium composite dibond pour enseignes durables et façades.", descAr: "لوحات ألومنيوم مركّب للافتات الدائمة والواجهات.", pub: 7000, cli: 5600, sub: 3500 },
        { nameFr: "Panneau plexiglass", nameAr: "لوحة بلاكسيغلاس", slug: "panneau-plexiglass", descFr: "Panneaux plexiglass transparents ou colorés pour affichage premium.", descAr: "لوحات بلاكسيغلاس شفافة أو ملونة للعرض الراقي.", pub: 8000, cli: 6400, sub: 4000 },
        { nameFr: "Plaque de porte", nameAr: "لوحة الباب", slug: "plaque-de-porte", descFr: "Plaques de porte personnalisées pour bureaux, cabinets et entreprises.", descAr: "لوحات باب مخصصة للمكاتب والعيادات والشركات.", pub: 3500, cli: 2800, sub: 1700 },
        { nameFr: "Plaque bureau", nameAr: "لوحة مكتب", slug: "plaque-bureau", descFr: "Plaques de bureau en aluminium brossé, plexiglass ou inox gravé.", descAr: "لوحات مكتب من الألومنيوم المصقول أو البلاكسيغلاس أو الفولاذ المنقوش.", pub: 4000, cli: 3200, sub: 2000 },
        { nameFr: "Plaque société", nameAr: "لوحة الشركة", slug: "plaque-societe", descFr: "Plaque d'identification de société pour entrée d'immeuble ou façade.", descAr: "لوحة هوية الشركة لمدخل العمارة أو الواجهة.", pub: 5500, cli: 4400, sub: 2700 },
        { nameFr: "Plaque directionnelle", nameAr: "لوحة اتجاهية", slug: "plaque-directionnelle", descFr: "Plaques directionnelles pour orientation dans les bâtiments et sites.", descAr: "لوحات اتجاهية للتوجيه داخل المباني والمواقع.", pub: 4800, cli: 3800, sub: 2400 },
      ],
      "plv-affichage-evenementiel": [
        { nameFr: "Roll-up", nameAr: "رول أب", slug: "roll-up-plv", descFr: "Roll-up standard ou premium pour salons, conférences et points de vente.", descAr: "رول أب عادي أو فاخر للمعارض والمؤتمرات ونقاط البيع.", pub: 5500, cli: 4400, sub: 2700 },
        { nameFr: "Kakemono événementiel", nameAr: "كاكيمونو للفعاليات", slug: "kakemono-evenementiel", descFr: "Kakemono suspendu pour expositions, galeries et événements d'entreprise.", descAr: "كاكيمونو معلق للمعارض والغاليريات وفعاليات الشركات.", pub: 6000, cli: 4800, sub: 3000 },
        { nameFr: "Stand parapluie", nameAr: "ستاند مظلة", slug: "stand-parapluie", descFr: "Stand parapluie modulable pour salons professionnels et expositions.", descAr: "ستاند مظلة قابل للتركيب للمعارض المهنية والمعارض.", pub: 12000, cli: 9600, sub: 6000 },
        { nameFr: "Comptoir promotionnel", nameAr: "كاونتر ترويجي", slug: "comptoir-promotionnel", descFr: "Comptoir promotionnel portable pour animations commerciales et salons.", descAr: "كاونتر ترويجي محمول للعروض التجارية والمعارض.", pub: 15000, cli: 12000, sub: 7500 },
        { nameFr: "Stop-trottoir", nameAr: "ستوب تروتوار", slug: "stop-trottoir", descFr: "Stop-trottoir A-frame double face pour commerces et restaurants.", descAr: "ستوب تروتوار على شكل A بجانبين للمحلات والمطاعم.", pub: 4500, cli: 3600, sub: 2200 },
        { nameFr: "Porte-affiche", nameAr: "حامل الملصق", slug: "porte-affiche", descFr: "Porte-affiche mural ou sur pied pour affichage événementiel et informatif.", descAr: "حامل ملصق جداري أو على حامل للعرض الفعالياتي والإعلامي.", pub: 3500, cli: 2800, sub: 1700 },
        { nameFr: "Présentoir produit", nameAr: "رف عرض المنتجات", slug: "presentoir-produit", descFr: "Présentoir produit en acrylique, PVC ou métal pour mise en valeur en point de vente.", descAr: "رف عرض المنتجات من الأكريليك أو PVC أو المعدن لتسليط الضوء على نقاط البيع.", pub: 5000, cli: 4000, sub: 2500 },
        { nameFr: "Backdrop événementiel", nameAr: "باك دروب للفعاليات", slug: "backdrop-evenementiel", descFr: "Backdrop en tissu tendu ou bâche pour événements, conférences et shootings.", descAr: "باك دروب من قماش مشدود أو بانيرو للفعاليات والمؤتمرات والتصوير.", pub: 7000, cli: 5600, sub: 3500 },
      ],
      "impression-uv-supports-rigides": [
        { nameFr: "Impression UV sur PVC", nameAr: "طباعة UV على PVC", slug: "uv-pvc", descFr: "Impression UV directe sur panneaux PVC pour signalétique et décoration.", descAr: "طباعة UV مباشرة على لوحات PVC للتوجيه والتزيين.", pub: 6000, cli: 4800, sub: 3000 },
        { nameFr: "Impression UV sur plexiglass", nameAr: "طباعة UV على بلاكسيغلاس", slug: "uv-plexiglass", descFr: "Impression UV sur plexiglass transparent ou coloré pour résultat premium.", descAr: "طباعة UV على بلاكسيغلاس شفاف أو ملون للحصول على نتيجة راقية.", pub: 8500, cli: 6800, sub: 4200 },
        { nameFr: "Impression UV sur aluminium composite", nameAr: "طباعة UV على الألومنيوم المركّب", slug: "uv-aluminium-composite", descFr: "Impression UV sur aluminium composite (dibond) pour enseignes et panneaux durables.", descAr: "طباعة UV على الألومنيوم المركّب للافتات واللوحات الدائمة.", pub: 9000, cli: 7200, sub: 4500 },
        { nameFr: "Impression UV sur bois", nameAr: "طباعة UV على الخشب", slug: "uv-bois", descFr: "Impression UV sur bois naturel ou MDF pour décoration et objets personnalisés.", descAr: "طباعة UV على الخشب الطبيعي أو MDF للديكور والمنتجات المخصصة.", pub: 7500, cli: 6000, sub: 3750 },
        { nameFr: "Impression UV sur verre", nameAr: "طباعة UV على الزجاج", slug: "uv-verre", descFr: "Impression UV sur verre pour décoration intérieure et vitrines premium.", descAr: "طباعة UV على الزجاج للديكور الداخلي والواجهات الراقية.", pub: 10000, cli: 8000, sub: 5000 },
        { nameFr: "Impression UV sur dibond", nameAr: "طباعة UV على ديبوند", slug: "uv-dibond", descFr: "Impression UV sur panneau dibond aluminium pour affichage haute durabilité.", descAr: "طباعة UV على لوحة ديبوند ألومنيوم للعرض عالي المتانة.", pub: 9500, cli: 7600, sub: 4750 },
        { nameFr: "Impression UV sur carton rigide", nameAr: "طباعة UV على الكرتون الصلب", slug: "uv-carton-rigide", descFr: "Impression UV sur carton rigide pour PLV, présentoirs et emballage premium.", descAr: "طباعة UV على الكرتون الصلب لوسائل العرض والتغليف الراقي.", pub: 5500, cli: 4400, sub: 2750 },
        { nameFr: "Impression UV sur support personnalisé", nameAr: "طباعة UV على دعامة مخصصة", slug: "uv-support-personnalise", descFr: "Impression UV sur tout support rigide non standard selon vos besoins spécifiques.", descAr: "طباعة UV على أي دعامة صلبة غير قياسية وفق احتياجاتك المحددة.", pub: 11000, cli: 8800, sub: 5500 },
      ],
    };

    for (const [catSlug, services] of Object.entries(servicesByCatSlug)) {
      const catRes = await pool.query(
        "SELECT id FROM service_categories WHERE slug = $1",
        [catSlug],
      );
      if (catRes.rowCount === 0) continue;
      const catId = catRes.rows[0].id;

      for (const svc of services) {
        await pool.query(
          `INSERT INTO services
             (category_id, name_fr, name_ar, slug, description_fr, description_ar,
              public_price_per_m2, client_price_per_m2, subcontractor_price_per_m2,
              active, requires_file_upload)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,false)
           ON CONFLICT (slug) DO NOTHING`,
          [catId, svc.nameFr, svc.nameAr, svc.slug, svc.descFr, svc.descAr, svc.pub, svc.cli, svc.sub],
        );
      }
    }

    logger.info("Service categories and services seeded");
  } catch (err) {
    logger.warn({ err }, "Could not seed categories/services");
  }
}

async function seedAdmin() {
  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@amirnumerique.dz"],
    );
    if (existing.rowCount === 0) {
      const hash = await bcrypt.hash("admin123456", 10);
      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, account_status)
         VALUES ($1, $2, $3, $4, $5)`,
        ["Administrateur", "admin@amirnumerique.dz", hash, "admin", "active"],
      );
      logger.info("Admin user created");
    }
  } catch (err) {
    logger.warn({ err }, "Could not seed admin user");
  }
}

async function seedImages() {
  try {
    const catImages: Record<string, string> = {
      "impression-bache": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Large_format_printing.jpg/960px-Large_format_printing.jpg",
      "enseignes-signaletique": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Sign_for_Roses_in_Waynesboro%2C_Virginia_%2850608495051%29.png/960px-Sign_for_Roses_in_Waynesboro%2C_Virginia_%2850608495051%29.png",
      "adhesifs-vitrophanie": "https://upload.wikimedia.org/wikipedia/commons/8/89/399_Bombardment_Sq_emblem.png",
      "roll-up-plv": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Bamboo_exhibition_equipment.jpg",
      "impression-papier": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Offset_printing_at_Watermark_Press%2C_San_Francisco%2C_California.jpg/960px-Offset_printing_at_Watermark_Press%2C_San_Francisco%2C_California.jpg",
      "impression-grand-format": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Digital_Printing_Press.JPG/960px-Digital_Printing_Press.JPG",
      "baches-publicitaires": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/NCH_advertising_banner_on_Nantun_Road_20230610a.jpg/960px-NCH_advertising_banner_on_Nantun_Road_20230610a.jpg",
      "stickers-adhesifs": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Large_format_printing.jpg/960px-Large_format_printing.jpg",
      "panneaux-plaques": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Lobby_Signage%2C_Severance_Hall%2C_University_Circle%2C_Cleveland%2C_OH.jpg/960px-Lobby_Signage%2C_Severance_Hall%2C_University_Circle%2C_Cleveland%2C_OH.jpg",
      "plv-affichage-evenementiel": "https://upload.wikimedia.org/wikipedia/commons/2/20/StateLibQld_2_201799_Trade_display_stands_at_the_Brisbane_Exhibition%2C_1907.jpg",
      "impression-uv-supports-rigides": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg/960px-Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg",
    };

    const svcImages: Record<string, string> = {
      "bache-publicitaire": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Stadium_banner_sign_for_a_kindergarten.jpg/960px-Stadium_banner_sign_for_a_kindergarten.jpg",
      "panneau-aluminium": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/960px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
      "flyers-depliants": "https://upload.wikimedia.org/wikipedia/commons/a/a3/The_OUN_leaflet_of_1949_is_dedicated_to_the_25th_anniversary_of_Mykola_Mikhnovsky%27s_death._Back.jpg",
      "stickers-adhesifs": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/800px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
      "roll-up-banner": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Medieval_rotating_harness_banner_%28FindID_567306%29.jpg/960px-Medieval_rotating_harness_banner_%28FindID_567306%29.jpg",
      "cartes-de-visite": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/WMW_business_card.png/960px-WMW_business_card.png",
      "bache-uv": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/960px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
      "bache-eco-solvant": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Large_format_printing.jpg/960px-Large_format_printing.jpg",
      "affiches-grand-format": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Mixing_printing_blocks_and_photographs_in_poster_design_%285463013381%29.jpg/960px-Mixing_printing_blocks_and_photographs_in_poster_design_%285463013381%29.jpg",
      "toile-canvas": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Mercurius_Abituriens_%28BM_1884%2C0112.64%29.jpg/960px-Mercurius_Abituriens_%28BM_1884%2C0112.64%29.jpg",
      "roll-up-visuels": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/2d_TSB_Battalions_roll-up_banner_%284999868%29.jpg/960px-2d_TSB_Battalions_roll-up_banner_%284999868%29.jpg",
      "papier-photo-grand-format": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Large_format_printing.jpg/960px-Large_format_printing.jpg",
      "enseigne-lumineuse": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Neon_shop_sign%2C_Meneage_Street%2C_Helston%2C_Cornwall_-_August_2024.jpg/960px-Neon_shop_sign%2C_Meneage_Street%2C_Helston%2C_Cornwall_-_August_2024.jpg",
      "enseigne-non-lumineuse": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sign-1140371%2C_Blackrock%2C_Co._Dublin%2C_Ireland.jpg/960px-Sign-1140371%2C_Blackrock%2C_Co._Dublin%2C_Ireland.jpg",
      "caisson-lumineux": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Gourmet_Bakers_backlit_Board.jpg",
      "lettres-decoupees": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/960px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
      "signaletique-interieure": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Lobby_Signage%2C_Severance_Hall%2C_University_Circle%2C_Cleveland%2C_OH.jpg/960px-Lobby_Signage%2C_Severance_Hall%2C_University_Circle%2C_Cleveland%2C_OH.jpg",
      "signaletique-exterieure": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Sign-1230020%2C_Leixlip%2C_Co._Kildare%2C_Ireland.jpg/960px-Sign-1230020%2C_Leixlip%2C_Co._Kildare%2C_Ireland.jpg",
      "plaque-professionnelle": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Ocasio-Cortez_office_nameplate_during_2018_office_setup.jpg/960px-Ocasio-Cortez_office_nameplate_during_2018_office_setup.jpg",
      "panneau-chantier": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Sign-1110783%2C_Wainuiomata%2C_Wellington%2C_New_Zealand.jpg/960px-Sign-1110783%2C_Wainuiomata%2C_Wellington%2C_New_Zealand.jpg",
      "bache-pub-uv": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Stadium_banner_sign_for_a_kindergarten.jpg/960px-Stadium_banner_sign_for_a_kindergarten.jpg",
      "bache-pub-eco-solvant": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/NCH_advertising_banner_on_Nantun_Road_20230610a.jpg/960px-NCH_advertising_banner_on_Nantun_Road_20230610a.jpg",
      "bache-facade": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Paris_9e_Wikivoyage_Banner.png/960px-Paris_9e_Wikivoyage_Banner.png",
      "bache-chantier": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/New_Snow_Fence_and_Concrete_Barrier_%2830533940823%29.jpg/960px-New_Snow_Fence_and_Concrete_Barrier_%2830533940823%29.jpg",
      "kakemono": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Wall-hanging%2C_commemorative_%28AM_1996.142.2.1%29.jpg/960px-Wall-hanging%2C_commemorative_%28AM_1996.142.2.1%29.jpg",
      "x-banner": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Belarusian_presidential_election_banner_2015.jpg/960px-Belarusian_presidential_election_banner_2015.jpg",
      "beach-flag": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/NCH_advertising_banner_on_Nantun_Road_20230610a.jpg/960px-NCH_advertising_banner_on_Nantun_Road_20230610a.jpg",
      "cartes-visite": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Calling_card_-_DPLA_-_5b4240c1fc8bd4d3f731c2facb743dc4.jpg/960px-Calling_card_-_DPLA_-_5b4240c1fc8bd4d3f731c2facb743dc4.jpg",
      "flyers": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Mixing_printing_blocks_and_photographs_in_poster_design_%285463013381%29.jpg/960px-Mixing_printing_blocks_and_photographs_in_poster_design_%285463013381%29.jpg",
      "depliants": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Pioneer_Zephyr_brochure_front.jpg",
      "brochures": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Offset_printing_at_Watermark_Press%2C_San_Francisco%2C_California.jpg/960px-Offset_printing_at_Watermark_Press%2C_San_Francisco%2C_California.jpg",
      "affiches-papier": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Mixing_printing_blocks_and_photographs_in_poster_design_%285463013381%29.jpg/960px-Mixing_printing_blocks_and_photographs_in_poster_design_%285463013381%29.jpg",
      "menus": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Offset_printing_at_Watermark_Press%2C_San_Francisco%2C_California.jpg/960px-Offset_printing_at_Watermark_Press%2C_San_Francisco%2C_California.jpg",
      "enveloppes-imprimees": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Offset_printing_at_Watermark_Press%2C_San_Francisco%2C_California.jpg/960px-Offset_printing_at_Watermark_Press%2C_San_Francisco%2C_California.jpg",
      "cartes-fidelite": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/WMW_business_card.png/960px-WMW_business_card.png",
      "sticker-vitrine": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Pegatina_de_vinilo_mapa_del_mundo.jpg",
      "sticker-mural": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Pegatina_de_vinilo_mapa_del_mundo.jpg",
      "vinyle-adhesif-imprime": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Large_format_printing.jpg/960px-Large_format_printing.jpg",
      "vinyle-decoupe": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Large_format_printing.jpg/960px-Large_format_printing.jpg",
      "vitrophanie": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Astronaut_dummy_in_store_window_of_Moncler_fashion_shop_in_Prague%2C_Czech_Republic.jpg/960px-Astronaut_dummy_in_store_window_of_Moncler_fashion_shop_in_Prague%2C_Czech_Republic.jpg",
      "film-microperfore": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/NCH_advertising_banner_on_Nantun_Road_20230610a.jpg/960px-NCH_advertising_banner_on_Nantun_Road_20230610a.jpg",
      "habillage-vitrine": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Pegatina_de_vinilo_mapa_del_mundo.jpg",
      "habillage-vehicule": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Jucy_Car_%2820132108710%29.jpg/960px-Jucy_Car_%2820132108710%29.jpg",
      "panneau-pvc": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Lobby_Signage%2C_Severance_Hall%2C_University_Circle%2C_Cleveland%2C_OH.jpg/960px-Lobby_Signage%2C_Severance_Hall%2C_University_Circle%2C_Cleveland%2C_OH.jpg",
      "panneau-forex": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/960px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
      "panneau-aluminium-composite": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/960px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
      "panneau-plexiglass": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Capp_Towers_Motor_Hotel_Rooftop_Dome_featuring_Plexiglas_panels_-_DPLA_-_628d6c4c19954a8f8b8df8a836cdad8a.jpg/960px-Capp_Towers_Motor_Hotel_Rooftop_Dome_featuring_Plexiglas_panels_-_DPLA_-_628d6c4c19954a8f8b8df8a836cdad8a.jpg",
      "plaque-de-porte": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Ocasio-Cortez_office_nameplate_during_2018_office_setup.jpg/960px-Ocasio-Cortez_office_nameplate_during_2018_office_setup.jpg",
      "plaque-bureau": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Ocasio-Cortez_office_nameplate_during_2018_office_setup.jpg/960px-Ocasio-Cortez_office_nameplate_during_2018_office_setup.jpg",
      "plaque-societe": "https://upload.wikimedia.org/wikipedia/commons/1/13/Hanwell_Community_Centre_-_Charlie_Chaplin_plaque_in_the_entrance_lobby_-_geograph.org.uk_-_1178192.jpg",
      "plaque-directionnelle": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Signs-1160719%2C_Maynooth%2C_Co._Kildare%2C_Ireland.jpg/960px-Signs-1160719%2C_Maynooth%2C_Co._Kildare%2C_Ireland.jpg",
      "roll-up-plv": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Bamboo_exhibition_equipment.jpg",
      "kakemono-evenementiel": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Bamboo_exhibition_equipment.jpg",
      "stand-parapluie": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ranger_Pilots_Outdoor_Exhibition_Display_%2803cc68d1-1dd8-b71b-0be7-8a8911207edf%29.jpg/960px-Ranger_Pilots_Outdoor_Exhibition_Display_%2803cc68d1-1dd8-b71b-0be7-8a8911207edf%29.jpg",
      "comptoir-promotionnel": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Bamboo_exhibition_equipment.jpg",
      "stop-trottoir": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Lobby_Signage%2C_Severance_Hall%2C_University_Circle%2C_Cleveland%2C_OH.jpg/960px-Lobby_Signage%2C_Severance_Hall%2C_University_Circle%2C_Cleveland%2C_OH.jpg",
      "porte-affiche": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Bamboo_exhibition_equipment.jpg",
      "presentoir-produit": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Bamboo_exhibition_equipment.jpg",
      "backdrop-evenementiel": "https://upload.wikimedia.org/wikipedia/commons/c/c2/WMF_Step_and_Repeat_Banner.jpg",
      "uv-pvc": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg/960px-Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg",
      "uv-plexiglass": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg/960px-Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg",
      "uv-aluminium-composite": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/960px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
      "uv-bois": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg/960px-Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg",
      "uv-verre": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg/960px-Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg",
      "uv-dibond": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg/960px-Large_Format_Printing_of_Black_Numbers_on_a_Brushed_Aluminum_Sheet.jpg",
      "uv-carton-rigide": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Recyclable_Cardboard_Packaging.jpg/960px-Recyclable_Cardboard_Packaging.jpg",
      "uv-support-personnalise": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg/960px-Lynx_ULTRA_64_Flatbed_UV_Rotary_Printing.jpg",
    };

    for (const [slug, url] of Object.entries(catImages)) {
      await pool.query(
        `UPDATE service_categories SET image_url = $1 WHERE slug = $2 AND image_url IS NULL`,
        [url, slug],
      );
    }
    for (const [slug, url] of Object.entries(svcImages)) {
      await pool.query(
        `UPDATE services SET image_url = $1 WHERE slug = $2 AND image_url IS NULL`,
        [url, slug],
      );
    }
    logger.info("Images seeded for categories and services");
  } catch (err) {
    logger.warn({ err }, "Could not seed images");
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await runInitSql();
  await seedAdmin();
  await seedCategoriesAndServices();
  await seedImages();
});
