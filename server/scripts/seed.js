require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Resource = require('../models/Resource');
const Event = require('../models/Event');
const Testimony = require('../models/Testimony');
const SiteContent = require('../models/SiteContent');
const Video = require('../models/Video');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@thetimeisnow.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

const products = [
  { name: 'UNASHAMED Classic Tee', description: 'Bold faith on premium cotton.', price: 28, category: 'merch', tag: 'Bestseller', stock: 50, images: ['/uploads/images/products/tee-gold.png'], sizes: ['S','M','L','XL','2XL'] },
  { name: 'The Time Is Now Tee', description: 'Movement statement tee.', price: 26, category: 'merch', stock: 40, images: ['/uploads/images/products/tee-cream.png'], sizes: ['S','M','L','XL','2XL'] },
  { name: 'Seventh Man Hoodie', description: 'Warm hoodie for outreach nights.', price: 55, category: 'merch', tag: 'New', stock: 30, images: ['/uploads/images/products/hoodie.png'], sizes: ['S','M','L','XL','2XL'] },
  { name: 'Bold Preacher Long Sleeve', description: 'Layer up and preach on.', price: 32, category: 'merch', stock: 25, images: ['/uploads/images/products/longsleeve.png'], sizes: ['S','M','L','XL','2XL'] },
  { name: 'Faith Over Fear Tank', description: 'Summer outreach essential.', price: 22, category: 'merch', stock: 35, images: ['/uploads/images/products/tank.png'], sizes: ['S','M','L','XL','2XL'] },
  { name: 'Gospel Flame Tee', description: 'Vibrant design for street preaching.', price: 27, category: 'merch', stock: 45, images: ['/uploads/images/products/flame-tee.png'], sizes: ['S','M','L','XL','2XL'] },
  { name: 'TTIN Snapback Cap', description: 'One size, embroidered logo.', price: 24, category: 'merch', stock: 60, images: ['/uploads/images/products/cap.png'] },
  { name: 'Unashamed Beanie', description: 'Winter preaching companion.', price: 20, category: 'merch', stock: 40, images: ['/uploads/images/products/beanie.png'] },
  { name: 'Movement Bucket Hat', description: 'Sun-ready street style.', price: 22, category: 'merch', stock: 30, images: ['/uploads/images/products/bucket.png'] },
  { name: 'Outreach Tote Bag', description: 'Carry tracts and Bibles anywhere.', price: 18, category: 'merch', stock: 50, images: ['/uploads/images/products/tote.png'] },
  { name: 'Faith Phone Case', description: 'Universal fit case.', price: 15, category: 'merch', stock: 100, images: ['/uploads/images/products/phonecase.png'] },
  { name: 'TTIN Water Bottle', description: 'Stay hydrated on the go.', price: 16, category: 'merch', stock: 55, images: ['/uploads/images/products/bottle.png'] },
  { name: 'Bold Wristband Pack (3)', description: 'Share the message daily.', price: 8, category: 'merch', stock: 200, images: ['/uploads/images/products/wristband.png'] },
  { name: 'Sticker Pack', description: '10 die-cut movement stickers.', price: 6, category: 'merch', stock: 300, images: ['/uploads/images/products/stickers.png'] },
  { name: 'TTIN Keychain', description: 'Metal keychain with logo.', price: 10, category: 'merch', stock: 80, images: ['/uploads/images/products/keychain.png'] },
  { name: 'Unashamed Book', description: 'The movement story in print.', price: 18, category: 'merch', tag: 'Featured', stock: 120, images: ['/uploads/images/products/book.png'] },
  { name: '30-Day Bold Faith Devotional', description: 'PDF devotional series.', price: 0, category: 'digital', downloadUrl: '/resources', stock: 999, images: ['/uploads/images/products/devotional.png'] },
  { name: 'Street Preaching Toolkit', description: 'Guides, scripts, and checklists.', price: 12, category: 'digital', stock: 999, images: ['/uploads/images/products/toolkit.png'] },
  { name: 'TTIN Wallpaper Pack', description: 'Mobile & desktop backgrounds.', price: 0, category: 'digital', stock: 999, images: ['/uploads/images/products/phonecase.png'] },
  { name: 'Open Air Guide', description: 'Step-by-step preaching guide.', price: 0, category: 'digital', stock: 999, images: ['/uploads/images/products/toolkit.png'] },
  { name: 'Bold Faith Journal', description: 'Printable journal pages.', price: 8, category: 'digital', stock: 999, images: ['/uploads/images/products/devotional.png'] },
  { name: 'Gospel Tracts (50 pack)', description: 'Outreach tracts bundle.', price: 12, category: 'merch', stock: 75, images: ['/uploads/images/products/tracts.png'] },
  { name: 'Witness Cards (25 pack)', description: 'Pocket-sized witness tools.', price: 9, category: 'merch', stock: 90, images: ['/uploads/images/products/tracts.png'] },
  { name: 'Outreach Starter Kit', description: 'Tracts, wristbands, and guide.', price: 35, category: 'merch', tag: 'Bundle', stock: 20, images: ['/uploads/images/products/kit.png'] },
];

const resources = [
  { title: "Foxe's Book of Martyrs", author: 'John Foxe', description: 'Classic account of Christian martyrs.', type: 'book', category: 'Church History & Martyrs for Christ', downloadUrl: '/resources/Foxe%27s%20Book%20of%20Martyrs.pdf', isFree: true },
  { title: "God's Generals - The Revivalists", author: 'Roberts Liardon', description: 'Stories of revival pioneers.', type: 'book', category: 'Church History & Martyrs for Christ', downloadUrl: '/resources/God%27s%20Generals-%20The%20Revivalists.pdf', isFree: true },
  { title: "God's Generals - Why They Succeeded and Why Some Failed", author: 'Roberts Liardon', description: 'Lessons from successful generals.', type: 'book', category: 'Church History & Martyrs for Christ', downloadUrl: '/resources/God%27s%20Generals-%20Why%20They%20Succeeded%20and%20Why%20Some%20Failed.pdf', isFree: true },
  { title: 'Revival In The Hebrides', author: 'Duncan Campbell', description: 'Scottish revival narrative.', type: 'book', category: 'Church History & Martyrs for Christ', downloadUrl: '/resources/Revival in the Hebrides.pdf', isFree: true },
  { title: 'Tortured For Christ', author: 'Richard Wurmbrand', description: 'Underground church testimony.', type: 'book', category: 'Church History & Martyrs for Christ', downloadUrl: '/resources/Tortured for Christ.pdf', isFree: true },
  { title: 'I Went To Hell', author: 'Marilyn A. Katz', description: 'Near-death testimony.', type: 'book', category: 'Other Inspiration', downloadUrl: '/resources/I Went To Hell.pdf', isFree: true },
  { title: 'Kathryn Kuhlman - Her Spiritual Legacy', author: 'Roberts Liardon', description: 'Biography of the healing evangelist.', type: 'book', category: 'Other Inspiration', downloadUrl: '/resources/Kathryn Kuhlman- Her Spiritual Legacy.pdf', isFree: true },
  { title: 'Now That You Are Born Again', author: 'Chris Oyakhilome', description: 'Foundations for new believers.', type: 'book', category: 'TTIN Resources', downloadUrl: '/resources/Now That You Are Born Again.pdf', isFree: true },
  { title: 'Recreating Your World', author: 'Chris Oyakhilome', description: 'Kingdom mindset teaching.', type: 'book', category: 'TTIN Resources', downloadUrl: '/resources/Recreating Your World.pdf', isFree: true },
  { title: 'The Power Of Tongues', author: 'Chris Oyakhilome', description: 'Teaching on prayer language.', type: 'book', category: 'TTIN Resources', downloadUrl: '/resources/The Power of Tongues.pdf', isFree: true },
  { title: 'The Seven Spirits Of God', author: 'Chris Oyakhilome', description: 'Spiritual insight.', type: 'book', category: 'TTIN Resources', downloadUrl: '/resources/The Seven Spirits of God.pdf', isFree: true },
  { title: 'When God Visits You', author: 'Chris Oyakhilome', description: 'Encountering God.', type: 'book', category: 'TTIN Resources', downloadUrl: '/resources/When God Visits You.pdf', isFree: true },
  { title: '30-Day Bold Faith Devotional', author: 'TTIN', description: 'Daily boldness prompts.', type: 'devotional', category: 'TTIN Resources', downloadUrl: 'https://drive.google.com/file/d/1Zej1g3M0KwKqIIGfDyheY1cv8txAvAko/view', isFree: true },
  { title: 'Street Preaching Guide', author: 'TTIN', description: 'Practical open-air guide.', type: 'guide', category: 'TTIN Resources', downloadUrl: 'https://drive.google.com/file/d/1x1yTVu10QGLhsBsecY0C-AXj_oxwSGei/view', isFree: true },
  { title: 'Witnessing Toolkit', author: 'TTIN', description: 'Tools for everyday evangelism.', type: 'guide', category: 'TTIN Resources', downloadUrl: 'https://drive.google.com/file/d/1f48cQfjKPsiLvnUlZKcSdOgYMvt1ioSy/view', isFree: true },
  { title: 'Apologetics Quick Reference', author: 'TTIN', description: 'Answers for common objections.', type: 'guide', category: 'TTIN Resources', downloadUrl: 'https://drive.google.com/file/d/1GIfK3x0fsSP_u_l1xHiHUuU-lt-V5GeL/view', isFree: true },
  { title: 'Unashamed Podcast Intro', author: 'TTIN', description: 'Audio introduction to the series.', type: 'podcast', category: 'TTIN Resources', downloadUrl: 'https://youtube.com/@TheTimeIsNow255', isFree: true },
  { title: 'Why Boldness Matters', author: 'TTIN', description: 'Article on living unashamed.', type: 'article', category: 'TTIN Resources', downloadUrl: 'https://thetimeisnow.org', isFree: true },
];

const events = [
  { title: 'Global Boldness Conference', description: 'A gathering of unashamed believers worldwide — worship, word, and sending.', date: new Date('2026-11-21'), time: '9:00 AM', location: 'Lagos, Nigeria', type: 'conference', capacity: 500 },
  { title: 'Street Preaching Workshop', description: 'Hands-on training for open-air evangelism. Leave ready to preach.', date: new Date('2026-10-17'), time: '2:00 PM', location: 'London, UK', type: 'workshop', capacity: 80 },
  { title: 'Campus Outreach Day', description: 'University campuses across 16 nations, one coordinated day of bold witness.', date: new Date('2026-10-03'), time: '10:00 AM', location: 'Multiple Cities', type: 'outreach', capacity: 0 },
  { title: 'Unashamed Online Prayer', description: 'Weekly prayer and testimony stream with the global family.', date: new Date('2026-09-24'), time: '7:00 PM', location: 'Zoom', type: 'online', capacity: 1000 },
  { title: 'Night of Fire: Year-End Rally', description: 'Close the year with worship, testimonies, and open-air commissioning.', date: new Date('2026-12-12'), time: '6:00 PM', location: 'Accra, Ghana', type: 'conference', capacity: 600 },
];

const testimonies = [
  { name: 'James O.', location: 'Nigeria', text: 'I preached on a bus for the first time and three people prayed to receive Christ.', category: 'Evangelism', isApproved: true, isFeatured: true },
  { name: 'Sarah M.', location: 'United Kingdom', text: 'The resources gave me courage to share at my workplace.', category: 'Workplace', isApproved: true },
  { name: 'David K.', location: 'Kenya', text: 'Our youth group now preaches openly every Saturday.', category: 'Youth', isApproved: true },
  { name: 'Elena R.', location: 'Spain', text: 'God used a simple conversation at the mall to change a life.', category: 'Lifestyle', isApproved: true },
  { name: 'Michael T.', location: 'United States', text: 'Apologetics training helped me answer tough questions on campus.', category: 'Apologetics', isApproved: true },
  { name: 'Grace A.', location: 'Ghana', text: 'We formed a preaching team at our church after joining TTIN.', category: 'Evangelism', isApproved: true },
];

const videos = [
  { title: 'Being Ambitious for Christ', description: 'What does it mean to be ambitious for Christ? This episode explores how to pursue boldness in your faith.', episode: 'EP 01', duration: '21', youtubeUrl: 'https://www.youtube.com/watch?v=pFyf6yPBr9A', order: 1 },
  { title: 'The Gospel Simplified', description: 'Understanding the simple, powerful message of the Gospel and how to share it boldly.', episode: 'EP 02', duration: '29', youtubeUrl: 'https://www.youtube.com/watch?v=ndP307bxp4k', order: 2 },
  { title: 'The Ministry of the Holy Spirit in Evangelism', description: 'Discover how the Holy Spirit empowers and guides us in proclaiming the Gospel.', episode: 'EP 03', duration: '86', youtubeUrl: 'https://www.youtube.com/watch?v=ahIbBSvVoQs', order: 3 },
  { title: 'Unashamed Webinar 3.0', description: 'Another powerful webinar on living an unashamed life for Christ.', episode: 'EP 04', duration: '120', youtubeUrl: 'https://www.youtube.com/watch?v=oxGmlhJDUq0', order: 4 },
];

const siteContent = [
  { key: 'hero', title: 'UNASHAMED OF THE GOSPEL.', content: 'A global movement teaching believers to preach boldly, live loudly, and carry the Gospel into streets, buses, campuses, and timelines.', type: 'hero', metadata: { kicker: 'The Time Is Now presents' } },
  { key: 'about', title: 'About', content: 'We are a global movement of unashamed believers.', type: 'about', metadata: {} },
  { key: 'mission', title: 'Mission', content: 'Empowering believers to live boldly.', type: 'mission', metadata: {} },
  { key: 'featured', title: 'Featured', content: 'Highlighted content and calls to action.', type: 'featured', metadata: {} },
];

/**
 * Seed the database. When `opts.wipe` is true existing collections are
 * cleared first; otherwise seeding is skipped for collections that already
 * contain documents (idempotent for dev auto-seeding).
 */
async function seedDatabase(opts = {}) {
  const wipe = opts.wipe !== false;

  if (wipe) {
    await Promise.all([
      Product.deleteMany({}),
      Resource.deleteMany({}),
      Event.deleteMany({}),
      Testimony.deleteMany({}),
      SiteContent.deleteMany({}),
      Video.deleteMany({}),
    ]);
  }

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: 'TTIN Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      emailVerified: true,
    });
    console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  const jobs = [];
  jobs.push(Product.countDocuments().then(async (n) => {
    if (n === 0) await Product.insertMany(products);
  }));
  jobs.push(Resource.countDocuments().then(async (n) => {
    if (n === 0) await Resource.insertMany(resources);
  }));
  jobs.push(Event.countDocuments().then(async (n) => {
    if (n === 0) await Event.insertMany(events);
  }));
  jobs.push(Testimony.countDocuments().then(async (n) => {
    if (n === 0) await Testimony.insertMany(testimonies);
  }));
  jobs.push(SiteContent.countDocuments().then(async (n) => {
    if (n === 0) await SiteContent.insertMany(siteContent);
  }));
  jobs.push(Video.countDocuments().then(async (n) => {
    if (n === 0) await Video.insertMany(videos);
  }));
  await Promise.all(jobs);

  const [p, r, e, t, s, v] = await Promise.all([
    Product.countDocuments(), Resource.countDocuments(), Event.countDocuments(),
    Testimony.countDocuments(), SiteContent.countDocuments(), Video.countDocuments(),
  ]);
  console.log(`Seed complete: ${p} products, ${r} resources, ${e} events, ${t} testimonies, ${s} site content, ${v} videos`);
  return { products: p, resources: r, events: e, testimonies: t, siteContent: s, videos: v };
}

module.exports = { seedDatabase };

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDatabase({ wipe: true });
    await mongoose.connection.close();
    process.exit(0);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
