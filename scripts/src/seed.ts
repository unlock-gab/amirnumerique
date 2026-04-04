import { db, usersTable, servicesTable, portfolioItemsTable, settingsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const [existingAdmin] = await db.select().from(usersTable).where(eq(usersTable.email, "admin@amirnumerique.dz"));

  if (!existingAdmin) {
    await db.insert(usersTable).values({
      fullName: "Admin Amir Numerique",
      email: "admin@amirnumerique.dz",
      passwordHash: adminPassword,
      role: "admin",
      preferredLanguage: "fr",
      accountStatus: "active",
    });
    console.log("Admin user created: admin@amirnumerique.dz / admin123456");
  }

  // Sample client user
  const clientPassword = await bcrypt.hash("client123", 12);
  const [existingClient] = await db.select().from(usersTable).where(eq(usersTable.email, "client@example.com"));

  if (!existingClient) {
    await db.insert(usersTable).values({
      fullName: "Ahmed Benali",
      email: "client@example.com",
      phone: "0555123456",
      passwordHash: clientPassword,
      role: "client",
      preferredLanguage: "fr",
      accountStatus: "active",
    });
    console.log("Client user created: client@example.com / client123");
  }

  // Services
  const existingServices = await db.select().from(servicesTable);
  if (existingServices.length === 0) {
    await db.insert(servicesTable).values([
      {
        nameFr: "Bâche Publicitaire",
        nameAr: "البانر الإعلاني",
        slug: "bache-publicitaire",
        descriptionFr: "Impression haute qualité sur bâche PVC 510g/m². Idéale pour les enseignes extérieures, événements et promotions. Résistante aux intempéries.",
        descriptionAr: "طباعة عالية الجودة على قماش PVC بوزن 510 جرام/م². مثالية للافتات الخارجية والفعاليات والعروض الترويجية. مقاومة للعوامل الجوية.",
        publicPricePerM2: 1200,
        clientPricePerM2: 1000,
        subcontractorPricePerM2: 750,
        requiresFileUpload: true,
        active: true,
      },
      {
        nameFr: "Panneau Aluminium",
        nameAr: "لافتة ألومنيوم",
        slug: "panneau-aluminium",
        descriptionFr: "Impression UV directe sur panneau aluminium composite 3mm. Surface brillante ou mat. Durable et résistant pour une utilisation intérieure et extérieure.",
        descriptionAr: "طباعة UV مباشرة على لوح ألومنيوم مركب بسماكة 3 مم. سطح لامع أو مطفأ. متين ومقاوم للاستخدام الداخلي والخارجي.",
        publicPricePerM2: 2500,
        clientPricePerM2: 2000,
        subcontractorPricePerM2: 1500,
        requiresFileUpload: true,
        active: true,
      },
      {
        nameFr: "Flyers & Dépliants",
        nameAr: "المنشورات والنشرات",
        slug: "flyers-depliants",
        descriptionFr: "Impression offset ou numérique de flyers, dépliants et brochures. Papier couché 90g à 350g. Format personnalisé disponible.",
        descriptionAr: "طباعة أوفست أو رقمية للمنشورات والنشرات والكتيبات. ورق مطلي من 90 إلى 350 جرام. أحجام مخصصة متاحة.",
        publicPricePerM2: 800,
        clientPricePerM2: 650,
        subcontractorPricePerM2: 500,
        requiresFileUpload: true,
        active: true,
      },
      {
        nameFr: "Stickers & Adhésifs",
        nameAr: "الملصقات والصور اللاصقة",
        slug: "stickers-adhesifs",
        descriptionFr: "Découpe et impression de stickers sur vinyle adhésif. Résistant UV et eau. Idéal pour vitrine, véhicule ou décoration.",
        descriptionAr: "قص وطباعة ملصقات على فينيل لاصق. مقاوم للأشعة فوق البنفسجية والماء. مثالي لواجهات المحلات أو السيارات أو الديكور.",
        publicPricePerM2: 1500,
        clientPricePerM2: 1200,
        subcontractorPricePerM2: 900,
        requiresFileUpload: true,
        active: true,
      },
      {
        nameFr: "Roll-Up Banner",
        nameAr: "راف-أب بانر",
        slug: "roll-up-banner",
        descriptionFr: "Impression sur papier satiné 220g avec film mat. Support enroulable inclus. Format standard 80x200cm ou sur mesure.",
        descriptionAr: "طباعة على ورق ساتان 220 جرام مع فيلم مطفأ. حامل قابل للطي مشمول. المقاس القياسي 80×200 سم أو حسب الطلب.",
        publicPricePerM2: 1800,
        clientPricePerM2: 1500,
        subcontractorPricePerM2: 1100,
        requiresFileUpload: true,
        active: true,
      },
      {
        nameFr: "Cartes de Visite",
        nameAr: "بطاقات الأعمال",
        slug: "cartes-de-visite",
        descriptionFr: "Impression professionnelle de cartes de visite sur papier couché 350g, avec ou sans pelliculage mat/brillant.",
        descriptionAr: "طباعة احترافية لبطاقات الأعمال على ورق مطلي 350 جرام، مع أو بدون تلميع مطفأ/لامع.",
        publicPricePerM2: 2000,
        clientPricePerM2: 1600,
        subcontractorPricePerM2: 1200,
        requiresFileUpload: true,
        active: true,
      },
    ]);
    console.log("Services created");
  }

  // Portfolio items
  const existingPortfolio = await db.select().from(portfolioItemsTable);
  if (existingPortfolio.length === 0) {
    await db.insert(portfolioItemsTable).values([
      {
        titleFr: "Enseigne Grand Format - Centre Commercial",
        titleAr: "لافتة كبيرة - مركز تجاري",
        descriptionFr: "Réalisation d'une enseigne lumineuse grand format pour un centre commercial à Alger.",
        descriptionAr: "تنفيذ لافتة إضاءة كبيرة لمركز تجاري في الجزائر العاصمة.",
        imageUrl: "https://images.unsplash.com/photo-1586366459782-4c3a82c3e86d?w=800",
        category: "enseigne",
        isFeatured: true,
      },
      {
        titleFr: "Habillage Véhicule - Flotte Commerciale",
        titleAr: "تغليف مركبة - أسطول تجاري",
        descriptionFr: "Habillage complet d'une flotte de 12 véhicules utilitaires pour une entreprise de livraison.",
        descriptionAr: "تغليف كامل لأسطول من 12 مركبة تجارية لشركة توصيل.",
        imageUrl: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800",
        category: "vehicule",
        isFeatured: true,
      },
      {
        titleFr: "Décoration Intérieure - Showroom",
        titleAr: "ديكور داخلي - معرض",
        descriptionFr: "Installation de visuels grand format pour la décoration intérieure d'un showroom automobile.",
        descriptionAr: "تركيب صور كبيرة للزينة الداخلية في معرض سيارات.",
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        category: "decoration",
        isFeatured: true,
      },
      {
        titleFr: "Stand Événementiel - Salon International",
        titleAr: "جناح فعالية - معرض دولي",
        descriptionFr: "Conception et impression de tous les supports visuels d'un stand pour un salon professionnel.",
        descriptionAr: "تصميم وطباعة جميع المواد البصرية لجناح في معرض مهني.",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        category: "evenement",
        isFeatured: false,
      },
      {
        titleFr: "Vitrophanie - Boutique Mode",
        titleAr: "ملصقات زجاج - متجر أزياء",
        descriptionFr: "Application de vitrophanie décorative sur toute la façade d'une boutique de mode.",
        descriptionAr: "تطبيق ملصقات زجاجية زخرفية على واجهة متجر أزياء بالكامل.",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
        category: "vitrophanie",
        isFeatured: false,
      },
      {
        titleFr: "Panneaux Routiers - Campagne Publicitaire",
        titleAr: "لوحات طرق - حملة إعلانية",
        descriptionFr: "Impression et installation de 40 panneaux publicitaires pour une campagne nationale.",
        descriptionAr: "طباعة وتركيب 40 لوحة إعلانية لحملة وطنية.",
        imageUrl: "https://images.unsplash.com/photo-1555443805-658637491dd4?w=800",
        category: "panneau",
        isFeatured: false,
      },
    ]);
    console.log("Portfolio items created");
  }

  // Settings
  const existingSettings = await db.select().from(settingsTable);
  if (existingSettings.length === 0) {
    await db.insert(settingsTable).values([
      { key: "company_name", value: "Amir Numerique" },
      { key: "company_phone", value: "+213 555 123 456" },
      { key: "company_email", value: "contact@amirnumerique.dz" },
      { key: "company_address", value: "Zone Industrielle, Alger, Algérie" },
      { key: "company_whatsapp", value: "+213 555 123 456" },
      { key: "hero_tagline_fr", value: "L'expertise en impression numérique grand format" },
      { key: "hero_tagline_ar", value: "خبرة في الطباعة الرقمية الكبيرة الحجم" },
    ]);
    console.log("Settings created");
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
