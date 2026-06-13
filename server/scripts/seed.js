require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Resource = require('../models/Resource');
const Event = require('../models/Event');
const Testimony = require('../models/Testimony');
const SiteContent = require('../models/SiteContent');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@thetimeisnow.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

const products = [
  { name: 'UNASHAMED Classic Tee', description: 'Bold faith on premium cotton.', price: 28, category: 'merch', tag: 'Bestseller', stock: 50 },
  { name: 'The Time Is Now Tee', description: 'Movement statement tee.', price: 26, category: 'merch', stock: 40 },
  { name: 'Seventh Man Hoodie', description: 'Warm hoodie for outreach nights.', price: 55, category: 'merch', stock: 30 },
  { name: 'Bold Preacher Long Sleeve', description: 'Layer up and preach on.', price: 32, category: 'merch', stock: 25 },
  { name: 'Faith Over Fear Tank', description: 'Summer outreach essential.', price: 22, category: 'merch', stock: 35 },
  { name: 'Gospel Flame Tee', description: 'Vibrant design for street preaching.', price: 27, category: 'merch', stock: 45 },
  { name: 'TTIN Snapback Cap', description: 'One size, embroidered logo.', price: 24, category: 'merch', stock: 60 },
  { name: 'Unashamed Beanie', description: 'Winter preaching companion.', price: 20, category: 'merch', stock: 40 },
  { name: 'Movement Bucket Hat', description: 'Sun-ready street style.', price: 22, category: 'merch', stock: 30 },
  { name: 'Outreach Tote Bag', description: 'Carry tracts and Bibles anywhere.', price: 18, category: 'merch', stock: 50 },
  { name: 'Faith Phone Case', description: 'Universal fit case.', price: 15, category: 'merch', stock: 100 },
  { name: 'TTIN Water Bottle', description: 'Stay hydrated on the go.', price: 16, category: 'merch', stock: 55 },
  { name: 'Bold Wristband Pack (3)', description: 'Share the message daily.', price: 8, category: 'merch', stock: 200 },
  { name: 'Sticker Pack', description: '10 die-cut movement stickers.', price: 6, category: 'merch', stock: 300 },
  { name: 'TTIN Keychain', description: 'Metal keychain with logo.', price: 10, category: 'merch', stock: 80 },
  { name: 'Unashamed Book', description: 'The movement story in print.', price: 18, category: 'digital', downloadUrl: '', stock: 999 },
  { name: '30-Day Bold Faith Devotional', description: 'PDF devotional series.', price: 0, category: 'digital', downloadUrl: '/resources', stock: 999 },
  { name: 'Street Preaching Toolkit', description: 'Guides, scripts, and checklists.', price: 12, category: 'digital', stock: 999 },
  { name: 'TTIN Wallpaper Pack', description: 'Mobile & desktop backgrounds.', price: 0, category: 'digital', stock: 999 },
  { name: 'Open Air Guide', description: 'Step-by-step preaching guide.', price: 0, category: 'digital', stock: 999 },
  { name: 'Bold Faith Journal', description: 'Printable journal pages.', price: 8, category: 'digital', stock: 999 },
  { name: 'Gospel Tracts (50 pack)', description: 'Outreach tracts bundle.', price: 12, category: 'merch', stock: 75 },
  { name: 'Witness Cards (25 pack)', description: 'Pocket-sized witness tools.', price: 9, category: 'merch', stock: 90 },
  { name: 'Outreach Starter Kit', description: 'Tracts, wristbands, and guide.', price: 35, category: 'merch', tag: 'Bundle', stock: 20 },
];

const resources = [
  { title: "Foxe's Book of Martyrs", author: 'John Foxe', description: 'Classic account of Christian martyrs.', type: 'book', category: 'Church History & Martyrs for Christ', downloadUrl: '/resources/Foxe\'s Book of Martyrs.pdf', isFree: true },
  { title: "God's Generals - The Revivalists", author: 'Roberts Liardon', description: 'Stories of revival pioneers.', type: 'book', category: 'Church History & Martyrs for Christ', downloadUrl: '/resources/God\'s Generals- The Revivalists.pdf', isFree: true },
  { title: "God's Generals - Why They Succeeded and Why Some Failed", author: 'Roberts Liardon', description: 'Lessons from successful generals.', type: 'book', category: 'Church History & Martyrs for Christ', downloadUrl: '/resources/God\'s Generals- Why They Succeeded and Why Some Failed.pdf', isFree: true },
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
  { title: 'Global Boldness Conference', description: 'A gathering of unashamed believers worldwide.', date: new Date('2026-08-15'), time: '9:00 AM', location: 'Lagos, Nigeria', type: 'conference', capacity: 500 },
  { title: 'Street Preaching Workshop', description: 'Hands-on training for open-air evangelism.', date: new Date('2026-06-20'), time: '2:00 PM', location: 'London, UK', type: 'workshop', capacity: 80 },
  { title: 'Campus Outreach Day', description: 'University campuses across 16 nations.', date: new Date('2026-05-30'), time: '10:00 AM', location: 'Multiple Cities', type: 'outreach', capacity: 0 },
  { title: 'Unashamed Online Prayer', description: 'Weekly prayer and testimony stream.', date: new Date('2026-05-22'), time: '7:00 PM', location: 'Zoom', type: 'online', capacity: 1000 },
];

const testimonies = [
  { name: 'James O.', location: 'Nigeria', text: 'I preached on a bus for the first time and three people prayed to receive Christ.', category: 'Evangelism', isApproved: true, isFeatured: true },
  { name: 'Sarah M.', location: 'United Kingdom', text: 'The resources gave me courage to share at my workplace.', category: 'Workplace', isApproved: true },
  { name: 'David K.', location: 'Kenya', text: 'Our youth group now preaches openly every Saturday.', category: 'Youth', isApproved: true },
  { name: 'Elena R.', location: 'Spain', text: 'God used a simple conversation at the mall to change a life.', category: 'Lifestyle', isApproved: true },
  { name: 'Michael T.', location: 'United States', text: 'Apologetics training helped me answer tough questions on campus.', category: 'Apologetics', isApproved: true },
  { name: 'Grace A.', location: 'Ghana', text: 'We formed a preaching team at our church after joining TTIN.', category: 'Evangelism', isApproved: true },
];

const siteContent = [
  { key: 'hero', title: 'The Time Is Now', content: 'Bold faith for today’s generation.', type: 'hero', metadata: {} },
  { key: 'about', title: 'About', content: 'We are a global movement of unashamed believers.', type: 'about', metadata: {} },
  { key: 'mission', title: 'Mission', content: 'Empowering believers to live boldly.', type: 'mission', metadata: {} },
  { key: 'featured', title: 'Featured', content: 'Highlighted content and calls to action.', type: 'featured', metadata: {} },
];

async function seed() {
  await connectDB();

  await Promise.all([
    Product.deleteMany({}),
    Resource.deleteMany({}),
    Event.deleteMany({}),
    Testimony.deleteMany({}),
    SiteContent.deleteMany({}),
  ]);

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
  } else {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  }

  await Product.insertMany(products);
  await Resource.insertMany(resources);
  await Event.insertMany(events);
  await Testimony.insertMany(testimonies);
  await SiteContent.insertMany(siteContent);

  console.log(`Seeded ${products.length} products, ${resources.length} resources, ${events.length} events, ${testimonies.length} testimonies, ${siteContent.length} site content`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
