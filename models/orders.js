// In-memory orders store
const orders = [];
let orderCounter = 1000;

const Orders = {
  getAll() {
    return [...orders].reverse(); // newest first
  },

  getById(id) {
    return orders.find(order => order.id === id) || null;
  },

  create(items, total) {
    orderCounter++;
    const order = {
      id: `ORD-${orderCounter}`,
      items: items.map(item => ({ ...item })),
      total: parseFloat(total.toFixed(2)),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    return order;
  }
};

module.exports = Orders;
