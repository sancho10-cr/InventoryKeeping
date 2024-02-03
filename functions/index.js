const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create Inventory Item with Input Validation, Authentication, and Error Handling
exports.createInventoryItem = functions.https.onRequest(async (req, res) => {
    try {
        // Input validation
        const { name, quantity, price, uid } = req.body;
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
        }
        if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).json({ error: 'Quantity is required and must be a positive number' });
        }
        if (!price || typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ error: 'Price is required and must be a positive number' });
        }

        // Authentication check
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized: Authentication required' });
        }

        // Firestore transaction to create inventory item
        await admin.firestore().runTransaction(async (transaction) => {
            const inventoryRef = admin.firestore().collection('inventory').doc();
            transaction.set(inventoryRef, { name, quantity, price, createdBy: uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        });

        res.status(200).json({ message: 'Inventory item created successfully' });
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Read Inventory Items with Pagination, Filtering, and Error Handling
exports.getInventoryItems = functions.https.onRequest(async (req, res) => {
    const { page, pageSize, filter } = req.query;
    let query = admin.firestore().collection('inventory');

    // Apply pagination
    if (page && pageSize) {
        query = query.limit(pageSize).offset(page * pageSize);
    }

    // Apply filtering
    if (filter) {
        query = query.where('name', '==', filter);
    }

    try {
        const snapshot = await query.get();
        const inventoryItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ inventoryItems });
    } catch (error) {
        console.error('Error getting inventory items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Inventory Item with Authentication and Error Handling
exports.updateInventoryItem = functions.https.onRequest(async (req, res) => {
    try {
        const { id, name, quantity, price, uid } = req.body;

        // Authentication check
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized: Authentication required' });
        }

        // Firestore transaction to update inventory item
        await admin.firestore().runTransaction(async (transaction) => {
            const inventoryRef = admin.firestore().collection('inventory').doc(id);
            const doc = await transaction.get(inventoryRef);

            if (!doc.exists) {
                throw new Error('Inventory item not found');
            }

            transaction.update(inventoryRef, { name, quantity, price, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        });

        res.status(200).json({ message: 'Inventory item updated successfully' });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Inventory Item with Authentication and Error Handling
exports.deleteInventoryItem = functions.https.onRequest(async (req, res) => {
    try {
        const { id, uid } = req.body;

        // Authentication check
        if (!uid) {
            return res.status(401).json({ error: 'Unauthorized: Authentication required' });
        }

        // Firestore transaction to delete inventory item
        await admin.firestore().runTransaction(async (transaction) => {
            const inventoryRef = admin.firestore().collection('inventory').doc(id);
            const doc = await transaction.get(inventoryRef);

            if (!doc.exists) {
                throw new Error('Inventory item not found');
            }

            transaction.delete(inventoryRef);
        });

        res.status(200).json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
