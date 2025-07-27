import Product from '@/models/Product';
import User from '@/models/User';

async function checkStockLevels() {
  const lowStockProducts = await Product.find({
    currentStock: { $lte: 10 }, // Example threshold
  });

  if (lowStockProducts.length > 0) {
    const usersToNotify = await User.find({
      role: { $in: ['admin', 'staff'] },
      'preferences.receiveLowStockAlerts': true,
    });
    const userEmails = usersToNotify.map((user) => user.email);

    if (userEmails.length === 0) {
      return;
    }

    for (const product of lowStockProducts) {
      const subject = `Low Stock Alert: ${product.name}`;
      const html = `
        <h1>Low Stock Alert</h1>
        <p>The stock for product <strong>${product.name}</strong> is low.</p>
        <p>Current quantity: ${product.currentStock}</p>
        <p>Please restock soon.</p>
      `;

      for (const email of userEmails) {
        // Don't send to dummy emails in production
        if (process.env.NODE_ENV === 'production' && email.endsWith('@abcd.com')) {
          continue;
        }
        
        fetch('http://localhost:3000/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            subject,
            html,
          }),
        }).catch(error => {
          console.error(`Failed to send alert for ${product.name} to ${email}:`, error);
        });
      }
    }
  }
}

export default checkStockLevels;