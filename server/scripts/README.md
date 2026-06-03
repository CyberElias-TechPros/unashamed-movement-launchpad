Inventory reservation test

This script simulates concurrent reservations against the `Product.stock` value to verify atomic updates and rollback behavior.

Usage:

```bash
# ensure MongoDB is reachable (default: mongodb://localhost:27017)
# set MONGO_URI if needed
cd server
node scripts/inventory_reservation_test.js
```

Notes:
- The script creates a temporary product, attempts two concurrent reservations, prints results, then restores and deletes the product.
- Requires the server's MongoDB to be available.
