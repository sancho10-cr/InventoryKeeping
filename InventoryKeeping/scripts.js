document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('inventoryForm');
    const inventoryList = document.getElementById('inventoryList');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const quantity = document.getElementById('quantity').value;
        const price = document.getElementById('price').value;
        const uid = document.getElementById('uid').value;

        try {
            const response = await fetch('/createInventoryItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, quantity, price, uid })
            });

            if (!response.ok) {
                throw new Error('Failed to add item');
            }

            const data = await response.json();
            alert(data.message); // Show success message
            form.reset(); // Clear form fields
            loadInventoryItems(); // Reload inventory items
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        }
    });

    async function loadInventoryItems() {
        try {
            const response = await fetch('/getInventoryItems');
            if (!response.ok) {
                throw new Error('Failed to fetch inventory items');
            }

            const data = await response.json();
            displayInventoryItems(data.inventoryItems);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        }
    }

    function displayInventoryItems(items) {
        inventoryList.innerHTML = ''; // Clear existing items
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.textContent = `Name: ${item.name}, Quantity: ${item.quantity}, Price: ${item.price}`;
            inventoryList.appendChild(itemElement);
        });
    }

    loadInventoryItems(); // Initial load of inventory items
});
