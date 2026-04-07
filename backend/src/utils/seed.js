const bcrypt = require('bcryptjs');
const Client = require('../models/Client');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const User = require('../models/User');

const DEFAULT_PRODUCTS = [
  {
    id: 'P-001',
    name: 'Filet Nylon 200m',
    description: 'Filet resistant pour peche hauturiere.',
    price: 380,
    quantity: 26,
    category: 'Filets',
    qrCode: 'QR-FILET-200',
  },
  {
    id: 'P-002',
    name: 'Corde Marine 80m',
    description: 'Corde anti-humidite pour amarres et traction.',
    price: 120,
    quantity: 14,
    category: 'Cordes',
    qrCode: 'QR-CORDE-080',
  },
  {
    id: 'P-003',
    name: 'Bouee Marker',
    description: 'Bouee de marquage haute visibilite.',
    price: 35,
    quantity: 6,
    category: 'Securite',
    qrCode: 'QR-BOUEE-010',
  },
];

const DEFAULT_SUPPLIERS = [
  {
    id: 'F-001',
    name: 'Atlantic Supplies',
    email: 'contact@atlanticsupplies.com',
    phone: '+212600000001',
    address: 'Port Zone, Agadir',
    productIds: ['P-001', 'P-002'],
  },
  {
    id: 'F-002',
    name: 'Blue Harbor Equipments',
    email: 'sales@blueharbor.com',
    phone: '+212600000002',
    address: 'Harbor Center, Casablanca',
    productIds: ['P-003'],
  },
];

const DEFAULT_CLIENTS = [
  {
    id: 'C-001',
    name: 'Ocean Nord',
    email: 'ops@oceannord.com',
    phone: '+212610000001',
    address: 'Docks 4, Tanger',
  },
  {
    id: 'C-002',
    name: 'Marina Atlas',
    email: 'contact@marinaatlas.com',
    phone: '+212610000002',
    address: 'Quai Sud, Agadir',
  },
];

const DEFAULT_ORDERS = [
  {
    id: 'CMD-500',
    clientId: 'C-001',
    items: [
      { productId: 'P-001', quantity: 2, unitPrice: 380 },
      { productId: 'P-002', quantity: 3, unitPrice: 120 },
    ],
    status: 'Confirmed',
    note: 'Initial seeded order',
    totalAmount: 1120,
  },
];

const DEFAULT_DELIVERIES = [
  {
    id: 'BL-800',
    orderId: 'CMD-500',
    items: [
      { productId: 'P-001', quantityDelivered: 1 },
      { productId: 'P-002', quantityDelivered: 1 },
    ],
    status: 'InTransit',
    note: 'Partial initial delivery',
  },
];

async function seedData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@marine.local',
      name: 'Administrator',
      passwordHash,
    });
    console.log('Default admin user created: admin@marine.local / admin123');
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(DEFAULT_PRODUCTS);
    console.log('Default products inserted.');
  }

  const supplierCount = await Supplier.countDocuments();
  if (supplierCount === 0) {
    await Supplier.insertMany(DEFAULT_SUPPLIERS);
    console.log('Default suppliers inserted.');
  }

  const clientCount = await Client.countDocuments();
  if (clientCount === 0) {
    await Client.insertMany(DEFAULT_CLIENTS);
    console.log('Default clients inserted.');
  }

  const orderCount = await Order.countDocuments();
  if (orderCount === 0) {
    await Order.insertMany(DEFAULT_ORDERS);
    console.log('Default orders inserted.');
  }

  const deliveryCount = await Delivery.countDocuments();
  if (deliveryCount === 0) {
    await Delivery.insertMany(DEFAULT_DELIVERIES);
    console.log('Default deliveries inserted.');
  }
}

module.exports = seedData;
