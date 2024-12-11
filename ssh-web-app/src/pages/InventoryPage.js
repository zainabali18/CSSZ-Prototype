import React, { useState, useEffect } from "react";

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Pantry', 'Other'];

const InventoryPage = ({ userEmail }) => {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("Other");
  const [expirationDate, setExpirationDate] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch inventory from the backend
  useEffect(() => {
    fetch(`http://localhost:5001/api/inventory?email=${userEmail}`)
      .then((response) => response.json())
      .then((data) => setInventory(data.inventory || []))
      .catch(() => setError("Error fetching inventory"));
  }, [userEmail]);

  // Add a new item
  const addItem = async () => {
    if (!newItem.trim() || quantity <= 0 || !expirationDate.trim()) {
      alert("Please enter valid item details.");
      return;
    }

    // Validate the expiration date format (YYYY/MM/DD)
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (!dateRegex.test(expirationDate)) {
      alert("Invalid date format. Please use the date picker.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          name: newItem.trim(),
          quantity,
          expiryDate: expirationDate,
          category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error adding item");
      }

      const data = await response.json();
      setInventory([...inventory, data.item]);
      setNewItem("");
      setQuantity(1);
      setCategory("Other");
      setExpirationDate("");
      alert("Item added successfully!");
    } catch (error) {
      console.error(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete an item
  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/inventory/${itemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) throw new Error("Error deleting item");

      setInventory(inventory.filter((item) => item.id !== itemId));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error.message);
      alert("Error deleting item.");
    }
  };

  // Start editing an item
  const startEditing = (item) => {
    setEditingItem({ ...item });
  };

  // Save edited item
  const saveEdit = async () => {
    if (!editingItem || editingItem.quantity < 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/inventory/${editingItem.id}/quantity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          quantity: editingItem.quantity,
        }),
      });

      if (!response.ok) throw new Error("Error updating item");

      const updatedItem = await response.json();
      setInventory((prev) =>
        prev.map((item) =>
          item.id === updatedItem.id ? updatedItem.item : item
        )
      );
      setEditingItem(null);
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error saving edits:", error.message);
      alert("Error saving edits.");
    }
  };

  return (
    <div className="container-fluid mainContainer">
      <h1 className="title_features">Inventory</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter item name..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ padding: "8px", marginRight: "10px", width: "80px" }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="date" // Updated to use a date picker
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button onClick={addItem} disabled={loading} className="save-button">
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Category</th>
            <th>Expiration Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                {editingItem?.id === item.id ? (
                  <input
                    type="number"
                    value={editingItem.quantity}
                    min="0"
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td>{item.category}</td>
              <td>{item.expiryDate}</td>
              <td>
                {editingItem?.id === item.id ? (
                  <button onClick={saveEdit} className="save-button">
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(item)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
