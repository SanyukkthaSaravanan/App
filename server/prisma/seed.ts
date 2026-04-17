/**
 * Seed script — populates the Flaire database with a fully-featured demo
 * account containing ~6 months of realistic data so reviewers can see the
 * app working end-to-end without manually entering anything.
 *
 *   Email:    demo@flaire.app
 *   Username: flaire_demo
 *   Password: FlaireDemo2026!
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { computeInsights } from '../src/services/insights.service';

const prisma = new PrismaClient();

// ---------- Demo credentials ----------
const DEMO = {
  email: 'demo@flaire.app',
  username: 'flaire_demo',
  password: 'FlaireDemo2026!',
  firstName: 'Maya',
  lastName: 'Patel',
};

// ---------- Helpers ----------
const day = 24 * 60 * 60 * 1000;
const now = Date.now();
const SEED_DAYS = 180; // ~6 months
const startMs = now - SEED_DAYS * day;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};
const j = (v: unknown) => JSON.stringify(v);

// Body parts the demo user logs symptoms on
const BODY_PARTS = [
  { id: 'left-knee', name: 'Left Knee', view: 'front' },
  { id: 'right-knee', name: 'Right Knee', view: 'front' },
  { id: 'left-hand', name: 'Left Hand', view: 'front' },
  { id: 'right-hand', name: 'Right Hand', view: 'front' },
  { id: 'left-fingers', name: 'Left Fingers', view: 'front' },
  { id: 'right-fingers', name: 'Right Fingers', view: 'front' },
  { id: 'left-wrist', name: 'Left Wrist', view: 'front' },
  { id: 'lower-back', name: 'Lower Back', view: 'side' },
  { id: 'neck', name: 'Neck', view: 'front' },
  { id: 'left-shoulder', name: 'Left Shoulder', view: 'front' },
];
const SYMPTOM_TAGS = ['Pain', 'Stiffness', 'Swelling', 'Tingling', 'Burning', 'Weakness'];
const GENERAL_SYMPTOMS = ['Fatigue', 'Brain Fog', 'Headache', 'Nausea', 'Dizziness'];

// Foods that occasionally trigger flares for this user
const COMMON_FOODS = [
  'Oatmeal',
  'Eggs',
  'Toast',
  'Coffee',
  'Greek yogurt',
  'Banana',
  'Salad',
  'Grilled chicken',
  'Brown rice',
  'Salmon',
  'Steamed broccoli',
  'Pasta',
  'Pizza',
  'Red wine',
  'Aged cheese',
  'Tomato sauce',
  'Dark chocolate',
  'Almonds',
  'Apple',
  'Soup',
];
const SUSPECTED_TRIGGERS = ['Aged cheese', 'Red wine', 'Tomato sauce', 'Pizza'];

async function main() {
  console.log('🌱  Seeding Flaire demo data...');

  // Wipe existing demo user (idempotent)
  const existing = await prisma.user.findUnique({ where: { email: DEMO.email } });
  if (existing) {
    console.log('   ↳ removing prior demo data');
    await prisma.user.delete({ where: { id: existing.id } });
  }

  // ---------- User ----------
  const user = await prisma.user.create({
    data: {
      email: DEMO.email,
      username: DEMO.username,
      passwordHash: await bcrypt.hash(DEMO.password, 10),
      firstName: DEMO.firstName,
      lastName: DEMO.lastName,
      dateOfBirth: new Date('1996-08-14'),
      timezone: 'Asia/Singapore',
      conditions: j(['Rheumatoid Arthritis', 'Mild IBS']),
      allergies: j(['Penicillin', 'Shellfish']),
    },
  });
  console.log(`   ✓ user: ${user.email}`);

  // ---------- Medications ----------
  const meds = await Promise.all([
    prisma.medication.create({
      data: {
        userId: user.id,
        name: 'Methotrexate',
        dosage: '15mg',
        frequency: 'Once weekly',
        timesPerDay: 1,
        scheduleTimes: j(['09:00']),
        startDate: new Date(startMs),
        color: '#7293BB',
        notes: 'Takes with folic acid the next day',
      },
    }),
    prisma.medication.create({
      data: {
        userId: user.id,
        name: 'Folic Acid',
        dosage: '5mg',
        frequency: 'Daily',
        timesPerDay: 1,
        scheduleTimes: j(['09:00']),
        startDate: new Date(startMs),
        color: '#A5D3CF',
      },
    }),
    prisma.medication.create({
      data: {
        userId: user.id,
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed',
        timesPerDay: 2,
        scheduleTimes: j(['08:00', '20:00']),
        startDate: new Date(startMs),
        color: '#E89BA1',
      },
    }),
    prisma.medication.create({
      data: {
        userId: user.id,
        name: 'Vitamin D3',
        dosage: '2000 IU',
        frequency: 'Daily',
        timesPerDay: 1,
        scheduleTimes: j(['08:30']),
        startDate: new Date(startMs),
        color: '#F59E0B',
      },
    }),
  ]);
  console.log(`   ✓ medications: ${meds.length}`);

  // ---------- Medication doses (~85% adherence) ----------
  const doseRecords: Array<{
    userId: string;
    medicationId: string;
    scheduledAt: Date;
    takenAt: Date | null;
    skipped: boolean;
  }> = [];
  for (let d = 0; d < SEED_DAYS; d++) {
    const dayStart = startMs + d * day;
    for (const med of meds) {
      // Methotrexate is weekly (only Mondays)
      if (med.name === 'Methotrexate' && new Date(dayStart).getDay() !== 1) continue;
      const times = JSON.parse(med.scheduleTimes) as string[];
      for (const t of times) {
        const [hh, mm] = t.split(':').map(Number);
        const scheduledAt = new Date(dayStart);
        scheduledAt.setHours(hh, mm, 0, 0);
        const taken = Math.random() < 0.85;
        const skipped = !taken && Math.random() < 0.5;
        doseRecords.push({
          userId: user.id,
          medicationId: med.id,
          scheduledAt,
          takenAt: taken ? new Date(+scheduledAt + randInt(-15, 90) * 60 * 1000) : null,
          skipped,
        });
      }
    }
  }
  // Bulk insert in chunks
  for (let i = 0; i < doseRecords.length; i += 500) {
    await prisma.medicationDose.createMany({ data: doseRecords.slice(i, i + 500) });
  }
  console.log(`   ✓ medication doses: ${doseRecords.length}`);

  // ---------- Daily check-ins ----------
  // Realistic pattern: weekly cycle (worse on Mondays from work stress),
  // monthly cycle (worse weeks 3 of each month), plus random noise.
  for (let d = 0; d < SEED_DAYS; d++) {
    if (Math.random() < 0.15) continue; // user misses ~15% of days
    const date = new Date(startMs + d * day);
    date.setHours(0, 0, 0, 0);
    const dow = date.getDay();
    const dayOfMonth = date.getDate();

    const stressBase =
      (dow === 1 ? 7 : dow === 5 ? 4 : 5) + (dayOfMonth >= 14 && dayOfMonth <= 21 ? 2 : 0);
    const stress = Math.min(10, Math.max(1, Math.round(stressBase + rand(-1.5, 1.5))));
    const sleepHours = Math.round((rand(5, 9) + (stress > 7 ? -1 : 0)) * 10) / 10;
    const sleep: 'poor' | 'okay' | 'good' =
      sleepHours < 6 ? 'poor' : sleepHours < 7.5 ? 'okay' : 'good';
    const energy = Math.min(10, Math.max(1, Math.round(11 - stress + rand(-1, 1))));
    const mood = Math.min(10, Math.max(1, energy + randInt(-1, 1)));

    const flareToday =
      stress >= 8 || sleep === 'poor'
        ? Math.random() < 0.4
        : Math.random() < 0.08;
    const flareStatus: 'no' | 'maybe' | 'yes' = flareToday
      ? 'yes'
      : Math.random() < 0.15
        ? 'maybe'
        : 'no';
    const painIntensity: 'mild' | 'moderate' | 'severe' = flareToday
      ? Math.random() < 0.5
        ? 'severe'
        : 'moderate'
      : energy >= 7
        ? 'mild'
        : 'moderate';

    await prisma.dailyCheckIn.create({
      data: {
        userId: user.id,
        date,
        energy,
        mood,
        stress,
        sleep,
        sleepHours,
        sleepDisrupted: stress > 7 && Math.random() < 0.6,
        painIntensity,
        painLocations: j(pickN(BODY_PARTS, randInt(1, 3)).map((b) => b.name)),
        painTypes: j(pickN(['Aching', 'Throbbing', 'Burning', 'Sharp', 'Stiff'], randInt(1, 2))),
        flareStatus,
        flareSeverity: flareToday ? (painIntensity as 'mild' | 'moderate' | 'severe') : null,
        medsTaken: Math.random() < 0.85 ? 'yes' : Math.random() < 0.5 ? 'some' : 'no',
        sideEffects: j(Math.random() < 0.15 ? ['Nausea'] : []),
        gutIssues: j(Math.random() < 0.2 ? pickN(['Bloating', 'Cramps', 'Reflux'], 1) : []),
        foodTriggers: j(
          Math.random() < 0.25 ? pickN(SUSPECTED_TRIGGERS, randInt(1, 2)) : []
        ),
        mobility: flareToday
          ? Math.random() < 0.5
            ? 'hard'
            : 'some-difficulty'
          : energy >= 7
            ? 'okay'
            : 'some-difficulty',
        notes:
          Math.random() < 0.25
            ? pick([
                'Long day at work, knees feel heavy.',
                'Slept badly, felt foggy all morning.',
                'Better afternoon after stretching.',
                'Yoga helped today.',
                'Skipped morning meds — felt off the rest of the day.',
              ])
            : null,
      },
    });
  }
  console.log(`   ✓ daily check-ins seeded`);

  // ---------- Symptom logs ----------
  for (let d = 0; d < SEED_DAYS; d++) {
    if (Math.random() < 0.4) continue; // not every day has explicit logs
    const date = new Date(startMs + d * day);
    date.setHours(randInt(7, 22), randInt(0, 59));
    const part = pick(BODY_PARTS);
    const tags = pickN(SYMPTOM_TAGS, randInt(1, 3));
    const severity = randInt(2, 9);
    await prisma.symptom.create({
      data: {
        userId: user.id,
        bodyPart: part.id,
        bodyPartName: part.name,
        symptoms: j(tags),
        severity,
        view: part.view,
        loggedAt: date,
        notes:
          Math.random() < 0.2
            ? pick([
                'Worse after typing all morning.',
                'Cold weather seems to make it flare.',
                'Eased after a hot bath.',
                'Started right after dinner.',
              ])
            : null,
      },
    });
  }
  // Plus general (whole-body) symptoms
  for (let i = 0; i < 40; i++) {
    const date = new Date(startMs + randInt(0, SEED_DAYS - 1) * day);
    date.setHours(randInt(8, 22), randInt(0, 59));
    const name = pick(GENERAL_SYMPTOMS);
    await prisma.symptom.create({
      data: {
        userId: user.id,
        bodyPart: null,
        bodyPartName: name,
        symptoms: j([name]),
        severity: randInt(3, 9),
        view: null,
        loggedAt: date,
      },
    });
  }
  console.log(`   ✓ symptom logs seeded`);

  // ---------- Diet logs ----------
  for (let d = 0; d < SEED_DAYS; d++) {
    if (Math.random() < 0.2) continue; // user misses ~20% of meal logging days
    const meals: Array<{ type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; hour: number; foods: string[]; cals: number }> = [
      {
        type: 'breakfast',
        hour: 8,
        foods: pickN(['Oatmeal', 'Eggs', 'Toast', 'Coffee', 'Greek yogurt', 'Banana'], 2),
        cals: randInt(300, 500),
      },
      {
        type: 'lunch',
        hour: 13,
        foods: pickN(['Salad', 'Grilled chicken', 'Brown rice', 'Soup', 'Pasta'], 2),
        cals: randInt(450, 700),
      },
      {
        type: 'dinner',
        hour: 19,
        foods: pickN(COMMON_FOODS, randInt(2, 4)),
        cals: randInt(500, 850),
      },
    ];
    if (Math.random() < 0.5) {
      meals.push({
        type: 'snack',
        hour: 16,
        foods: pickN(['Almonds', 'Apple', 'Dark chocolate', 'Greek yogurt'], 1),
        cals: randInt(100, 250),
      });
    }
    for (const m of meals) {
      const ateAt = new Date(startMs + d * day);
      ateAt.setHours(m.hour, randInt(0, 59));
      const foundTriggers = m.foods.filter((f) => SUSPECTED_TRIGGERS.includes(f));
      await prisma.dietLog.create({
        data: {
          userId: user.id,
          mealType: m.type,
          foods: j(m.foods),
          triggers: j(foundTriggers),
          calories: m.cals,
          ateAt,
        },
      });
    }
  }
  console.log(`   ✓ diet logs seeded`);

  // ---------- Flare events ----------
  // Spread 5 flares across the period
  const flareDays = [10, 38, 67, 102, 145, 168];
  for (const d of flareDays) {
    if (d >= SEED_DAYS) continue;
    const startedAt = new Date(startMs + d * day);
    startedAt.setHours(randInt(10, 18));
    const lengthDays = randInt(1, 4);
    await prisma.flareEvent.create({
      data: {
        userId: user.id,
        startedAt,
        endedAt: new Date(+startedAt + lengthDays * day),
        severity: randInt(6, 10),
        triggers: j(pickN(['Cold weather', 'Stress', 'Poor sleep', 'Aged cheese', 'Red wine'], 2)),
        locations: j(pickN(BODY_PARTS, randInt(1, 3)).map((b) => b.name)),
        notes: pick([
          'Started after a stressful work week.',
          'Both knees swollen, hard to walk stairs.',
          'Hands stiff for most of the morning.',
          'Triggered after dinner with red wine and cheese board.',
        ]),
        resolved: true,
      },
    });
  }
  console.log(`   ✓ flare events: ${flareDays.length}`);

  // ---------- Medical records ----------
  const records = [
    { title: 'Rheumatology consultation', type: 'visit', provider: 'Dr. Lim', daysAgo: 170 },
    { title: 'Blood panel — RA factor + ESR', type: 'lab', provider: 'Singapore General Hospital', daysAgo: 165 },
    { title: 'Knee MRI', type: 'imaging', provider: 'Mount Elizabeth Imaging', daysAgo: 130 },
    { title: 'Methotrexate prescription renewal', type: 'prescription', provider: 'Dr. Lim', daysAgo: 90 },
    { title: 'Follow-up rheumatology visit', type: 'visit', provider: 'Dr. Lim', daysAgo: 60 },
    { title: 'Vitamin D blood test', type: 'lab', provider: 'Raffles Medical', daysAgo: 45 },
    { title: 'Annual physical', type: 'visit', provider: 'Dr. Tan (GP)', daysAgo: 14 },
  ];
  for (const r of records) {
    await prisma.medicalRecord.create({
      data: {
        userId: user.id,
        title: r.title,
        type: r.type,
        providerName: r.provider,
        date: new Date(now - r.daysAgo * day),
        tags: j(['RA', r.type]),
      },
    });
  }
  console.log(`   ✓ medical records: ${records.length}`);

  // ---------- Community: a couple of other users + posts ----------
  const peerUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sam@flaire.app',
        username: 'sam_warrior',
        passwordHash: await bcrypt.hash('PeerDemo2026!', 10),
        firstName: 'Sam',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jules@flaire.app',
        username: 'jules_h',
        passwordHash: await bcrypt.hash('PeerDemo2026!', 10),
        firstName: 'Jules',
      },
    }),
  ]);
  const posts = [
    { author: user.id, content: 'Made it through a 5km walk today — first time since the last flare. Small wins!', tags: ['progress', 'movement'], likes: 24 },
    { author: peerUsers[0].id, content: 'Anyone else find oat milk easier on their gut than dairy? Switched last month and inflammation feels lower.', tags: ['diet', 'gut-health'], likes: 13 },
    { author: peerUsers[1].id, content: 'New rheumatologist actually listened. If you\'re looking for a recommendation in Singapore, DM me.', tags: ['providers'], likes: 41 },
    { author: user.id, content: 'Cold rain today and my hands feel like they\'re full of glass. Heating pad + light stretches helping.', tags: ['flare', 'weather'], likes: 18 },
    { author: peerUsers[0].id, content: 'Update: 6 months on methotrexate, blood markers are way down. Hang in there if you\'re newly diagnosed.', tags: ['methotrexate', 'progress'], likes: 67 },
  ];
  for (const p of posts) {
    await prisma.communityPost.create({
      data: {
        userId: p.author,
        content: p.content,
        tags: j(p.tags),
        likes: p.likes,
        createdAt: new Date(now - randInt(1, 60) * day),
      },
    });
  }
  console.log(`   ✓ community posts: ${posts.length}`);

  // ---------- Insights (computed from real seeded data) ----------
  await computeInsights(user.id);
  console.log(`   ✓ insights computed`);

  console.log('\n✅  Seed complete!\n');
  console.log('--- DEMO LOGIN ---');
  console.log(`   email:    ${DEMO.email}`);
  console.log(`   username: ${DEMO.username}`);
  console.log(`   password: ${DEMO.password}`);
  console.log('------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
