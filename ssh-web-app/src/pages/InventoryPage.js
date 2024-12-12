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

    // Validate the expiration date format (YYYY-MM-DD)
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
  
      const data = await response.json(); // Log the response for debugging
      console.log("Server response:", data);
  
      // Update inventory only if the returned item matches the structure
      if (data.item) {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === data.item.id ? { ...item, ...data.item } : item
          )
        );
        alert("Item updated successfully!");
      } else {
        console.error("Invalid server response:", data);
        alert("Error updating inventory. Please try again.");
      }
  
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving edits:", error.message);
      alert("Error saving edits.");
    }
  };
  

  return (
    <div>
      <div className="title-container">
        <h1 className="page-title">My Inventory</h1>
        <div className="color-legend">
          <div className="legend-item">
            <span className="legend-circle red"></span> Dispose
          </div>
          <div className="legend-item">
            <span className="legend-circle yellow"></span> Use Me ASAP!
          </div>
          <div className="legend-item">
            <span className="legend-circle green"></span> New
          </div>
        </div>
      </div>
    <div className="container-fluid" style={{ marginBottom: "5%", paddingLeft: "50px", paddingRight: "50px" }}>
      <div className="inventory-form"style={{ marginTop: "20px", marginBottom: "20px", gap: "10px" }}>
        <input
          type="text"
          placeholder="Enter item name..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="inventory-input"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="inventory-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="inventory-input"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          className="inventory-input"
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
          {inventory.map((item) => {
            const today = new Date();
            const expirationDate = new Date(item.expiryDate);
            const daysToExpire = (expirationDate - today) / (1000 * 60 * 60 * 24);

            let rowClass = "";
            if (daysToExpire < 0) {
              rowClass = "expired";
            } else if (daysToExpire <= 2) {
              rowClass = "expiring-soon";
            } else {
              rowClass = "new-item";
            }

            return (
              <tr key={item.id} className={rowClass}>
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
                    <button onClick={saveEdit} className="inventory-save-button">
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
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default InventoryPage;
