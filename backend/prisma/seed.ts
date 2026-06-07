import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// PRESET TRANSPORT COMPANIES (from frontend COMPANIES_TRANSLATIONS)
// ─────────────────────────────────────────────────────────
const PRESET_COMPANIES = [
  { name: 'Raja Murugan Transport', nameTA: 'ராஜமுருகன் டிரான்ஸ்போர்ட்' },
  { name: 'Vijay Road Lines', nameTA: 'விஜய் ரோடு லைன்ஸ்' },
  { name: 'NSS Transport', nameTA: 'என்.எஸ்.எஸ். டிரான்ஸ்போர்ட்' },
  { name: 'ENT', nameTA: 'இ.என்.டி.' },
  { name: 'NE Transport', nameTA: 'என்.இ. டிரான்ஸ்போர்ட்' },
  { name: 'MLS Transport', nameTA: 'எம்.எல்.எஸ். டிரான்ஸ்போர்ட்' },
  { name: 'Omega Transport', nameTA: 'ஒமேகா டிரான்ஸ்போர்ட்' },
  { name: 'Sri Sai Transport', nameTA: 'ஸ்ரீ சாய் டிரான்ஸ்போர்ட்' },
  { name: 'Adithya Transport', nameTA: 'ஆதித்யா டிரான்ஸ்போர்ட்' },
  { name: 'PCS Transport', nameTA: 'பி.சி.எஸ். டிரான்ஸ்போர்ட்' },
  { name: 'ASN Transport', nameTA: 'ஏ.எஸ்.என். டிரான்ஸ்போர்ட்' },
  { name: 'Eagle Transport', nameTA: 'ஈகிள் டிரான்ஸ்போர்ட்' },
  { name: 'ATR Transport', nameTA: 'ஏ.டி.ஆர். டிரான்ஸ்போர்ட்' },
  { name: 'Siteshwar Transport', nameTA: 'சித்தேஷ்வர் டிரான்ஸ்போர்ட்' },
  { name: 'VPS Logistics', nameTA: 'வி.பி.எஸ். லாஜிஸ்டிக்ஸ்' },
  { name: 'Pulavar Transport', nameTA: 'புலவர் டிரான்ஸ்போர்ட்' },
  { name: 'SRTS Transport', nameTA: 'எஸ்.ஆர்.டி.எஸ். டிரான்ஸ்போர்ட்' },
  { name: 'Anjaneyar Bunk', nameTA: 'ஆஞ்சநேயர் பங்க்' },
  { name: 'SKP Transport', nameTA: 'எஸ்.கே.பி. டிரான்ஸ்போர்ட்' },
  { name: 'TPLS Transport', nameTA: 'டி.பி.எல்.எஸ். டிரான்ஸ்போர்ட்' },
  { name: 'EverGreen Transport', nameTA: 'எவர்கிரீன் டிரான்ஸ்போர்ட்' },
  { name: 'Barrel Transport', nameTA: 'பேரல் டிரான்ஸ்போர்ட்' },
];

// ─────────────────────────────────────────────────────────
// PRESET WELDING WORKS (from frontend WELDING_WORKS_TRANSLATIONS)
// ─────────────────────────────────────────────────────────
const PRESET_SERVICES = [
  { name: 'Tank U-clamp fitting', nameTA: 'டேங்க் U-கிளாம்ப் பிட்டிங்' },
  { name: 'Six master valve open', nameTA: 'ஆறு மாஸ்டர் வால்வு திறப்பு' },
  { name: 'Six master valve fitting', nameTA: 'ஆறு மாஸ்டர் வால்வு பொருத்துதல்' },
  { name: 'Six master valve fitting work', nameTA: 'ஆறு மாஸ்டர் வால்வு பொருத்தும் வேலை' },
  { name: 'Tank leakage', nameTA: 'டேங்க் கசிவு அடைத்தல்' },
  { name: 'Six compartment leakage', nameTA: 'ஆறு கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  { name: '1st compartment leakage', nameTA: '1வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  { name: '2nd compartment leakage', nameTA: '2வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  { name: '3rd compartment leakage', nameTA: '3வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  { name: '4th compartment leakage', nameTA: '4வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  { name: '5th compartment leakage', nameTA: '5வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  { name: '6th compartment leakage', nameTA: '6வது கம்பார்ட்மென்ட் கசிவு அடைத்தல்' },
  { name: 'Reliance dome SS welding', nameTA: 'ரிலையன்ஸ் டோம் SS வெல்டிங்' },
  { name: 'Reliance dome MS welding', nameTA: 'ரிலையன்ஸ் டோம் MS வெல்டிங்' },
  { name: 'Tank side bottom welding', nameTA: 'டேங்க் பக்கவாட்டு பாட்டம் வெல்டிங்' },
  { name: 'Tank side bottom bending', nameTA: 'டேங்க் பக்கவாட்டு பாட்டம் பெண்டிங்' },
  { name: 'Tank side disc bending', nameTA: 'டேங்க் பக்கவாட்டு டிஸ்க் பெண்டிங்' },
  { name: 'Six gate valve rope', nameTA: 'ஆறு கேட் வால்வு ரோப்' },
  { name: 'Six master valve pipeline and master valve fitting', nameTA: 'ஆறு மாஸ்டர் வால்வு பைப்லைன் மற்றும் மாஸ்டர் வால்வு பொருத்துதல்' },
  { name: 'Six master valve rope and 5 fitting', nameTA: 'ஆறு மாஸ்டர் வால்வு ரோப் மற்றும் 5 பொருத்துதல்' },
  { name: 'Six master side rope', nameTA: 'ஆறு மாஸ்டர் பக்கவாட்டு ரோப்' },
  { name: 'Four side margard welding', nameTA: 'நான்கு பக்க மட்கார்டு வெல்டிங்' },
  { name: 'Back side ladder fitting and welding', nameTA: 'பின்பக்க ஏணி பொருத்துதல் மற்றும் வெல்டிங்' },
  { name: 'Back bumper remove and fitting', nameTA: 'பின்பக்க பம்பர் கழற்றி மாட்டுதல்' },
  { name: 'Back safety guard remove and fitting', nameTA: 'பின்பக்க சேஃப்டி கார்டு கழற்றி மாட்டுதல்' },
  { name: 'Back six compartment rope adjustment', nameTA: 'பின்பக்க ஆறு கம்பார்ட்மென்ட் ரோப் அட்ஜஸ்ட்மென்ட்' },
  { name: 'Back rope box welding', nameTA: 'பின்பக்க ரோப் பாக்ஸ் வெல்டிங்' },
  { name: 'Mirrorless dome rack rail welding', nameTA: 'மிரர்லெஸ் டோம் ராக் ரெயில் வெல்டிங்' },
  { name: 'Reliance dome Madras steel welding', nameTA: 'ரிலையன்ஸ் டோம் மெட்ராஸ் ஸ்டீல் வெல்டிங்' },
  { name: 'Side number plate welding', nameTA: 'பக்கவாட்டு நம்பர் பிளேட் வெல்டிங்' },
  { name: 'Reliance hall ration SS', nameTA: 'ரிலையன்ஸ் ஹால் ரேஷன் SS' },
  { name: 'Right side ladder work', nameTA: 'வலது பக்க ஏணி வேலை' },
  { name: 'Sun side pipe work', nameTA: 'சன் சைடு பைப் வேலை' },
  { name: 'Double side rope', nameTA: 'இருபுறமும் ரோப்' },
  { name: 'New manhole packing', nameTA: 'புதிய மேன்ஹோல் பேக்கிங்' },
  { name: '4 inch manhole wood cutting', nameTA: '4 இன்ச் மேன்ஹோல் மரம் வெட்டுதல்' },
  { name: 'Manhole new building', nameTA: 'புதிய மேன்ஹோல் அமைத்தல்' },
  { name: 'Manhole top work', nameTA: 'மேன்ஹோல் டாப் வேலை' },
  { name: 'Gate valve box rope box', nameTA: 'கேட் வால்வு பாக்ஸ் ரோப் பாக்ஸ்' },
  { name: '1 inch bed labor and U-clamp', nameTA: '1 இன்ச் பெட் லேபர் மற்றும் U-கிளாம்ப்' },
  { name: 'Seven inch allied packing and PVC packing', nameTA: 'ஏழு இன்ச் அலைடு பேக்கிங் மற்றும் PVC பேக்கிங்' },
  { name: '21 inch bit labor work fitting', nameTA: '21 இன்ச் பிட் லேபர் வேலை பொருத்துதல்' },
  { name: 'Tank back SS lot bending and welding', nameTA: 'டேங்க் பின்புற SS லாட் பெண்டிங் மற்றும் வெல்டிங்' },
  { name: 'New common valve', nameTA: 'புதிய காமன் வால்வு' },
  { name: 'H nipple new', nameTA: 'புதிய H நிப்பிள்' },
  { name: '3 inch aluminium cup', nameTA: '3 இன்ச் அலுமினியம் கப்' },
  { name: '4 inch aluminium cup', nameTA: '4 இன்ச் அலுமினியம் கப்' },
  { name: 'Fire gun standard new', nameTA: 'புதிய ஃபயர் கன் ஸ்டாண்டர்ட்' },
  { name: 'P V valve', nameTA: 'P V வால்வு' },
  { name: 'Emergency vent', nameTA: 'எமர்ஜென்சி வென்ட்' },
  { name: 'Fusible link', nameTA: 'பியூசிபில் லிங்க்' },
  { name: 'Ss gatevalve', nameTA: 'SS கேட் வால்வு' },
  { name: 'Ms mastervalve', nameTA: 'MS மாஸ்டர் வால்வு' },
];

// ─────────────────────────────────────────────────────────
// DEFAULT SETTINGS
// ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = [
  { key: 'business_name', value: 'SRI BALAMURUGAN TANKER WELDING' },
  { key: 'business_sub', value: 'Specialists in Heavy Tankers, Gas Linings, Dairy & Oil Fleet Repair Works' },
  { key: 'business_address', value: 'Salem - Namakkal Highway, Namakkal, Tamil Nadu 637001' },
  { key: 'business_phone', value: '+919876543210' },
  { key: 'business_email', value: 'billing@sribalamurugan.com' },
  { key: 'business_gstin', value: '33AAAAA1111A1Z1' },
  { key: 'invoice_footer_terms', value: 'Thank you for your business. All repairs are certified for high-pressure operations. In case of leaks, notify within 30 days.' },
  { key: 'gst_rate_cgst', value: '9' },
  { key: 'gst_rate_sgst', value: '9' },
  { key: 'bill_prefix_labour', value: 'SBT-L' },
  { key: 'bill_prefix_parts', value: 'SBT-O' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Customers (Preset Transport Companies) ──────────────
  console.log('  📦 Seeding preset transport companies...');
  for (const company of PRESET_COMPANIES) {
    await prisma.customer.upsert({
      where: { id: company.name }, // use name as temp lookup
      create: {
        name: company.name,
        nameTA: company.nameTA,
        isPreset: true,
        isActive: true,
      },
      update: {
        nameTA: company.nameTA,
        isPreset: true,
      },
    });
  }
  // Re-do using findFirst for upsert-by-name pattern
  for (const company of PRESET_COMPANIES) {
    const existing = await prisma.customer.findFirst({ where: { name: company.name } });
    if (!existing) {
      await prisma.customer.create({
        data: { name: company.name, nameTA: company.nameTA, isPreset: true },
      });
    }
  }
  console.log(`  ✅ ${PRESET_COMPANIES.length} transport companies seeded`);

  // ── Services (Welding Works) ─────────────────────────────
  console.log('  🔧 Seeding welding services...');
  for (const service of PRESET_SERVICES) {
    const existing = await prisma.service.findFirst({ where: { name: service.name } });
    if (!existing) {
      await prisma.service.create({
        data: {
          name: service.name,
          nameTA: service.nameTA,
          isSystem: true,
          isActive: true,
        },
      });
    }
  }
  console.log(`  ✅ ${PRESET_SERVICES.length} welding services seeded`);

  // ── Default Settings ─────────────────────────────────────
  console.log('  ⚙️  Seeding default settings...');
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: { key: setting.key, value: setting.value },
      update: {}, // never overwrite existing settings
    });
  }
  console.log(`  ✅ ${DEFAULT_SETTINGS.length} settings seeded`);

  // ── Admin User ────────────────────────────────────────────
  console.log('  👤 Seeding admin user...');
  const adminMobile = process.env.ADMIN_MOBILE || '+919999999999';
  const existingAdmin = await prisma.user.findUnique({ where: { mobile: adminMobile } });
  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        mobile: adminMobile,
        name: 'Sri Balamurugan',
        role: Role.ADMIN,
        isActive: true,
      },
    });
    // Set default PIN: 123456 (admin must change via Settings on first login)
    const pinHash = await bcrypt.hash('123456', 12);
    await prisma.userPin.create({
      data: { userId: admin.id, pinHash },
    });
    console.log(`  ✅ Admin user created: ${adminMobile} (default PIN: 123456 — CHANGE IMMEDIATELY)`);
  } else {
    console.log(`  ℹ️  Admin user already exists: ${adminMobile}`);
  }

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
