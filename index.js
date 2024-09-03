const express = require('express');
const users = require('./MOCK_DATA.json');
const app = express();
const fs = require('fs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Middleware to parse JSON data from the request body

// Routes

// Get all users
app.get('/api/users', (req, res) => {
    return res.json(users);
});

// Dynamic route for getting, updating, and deleting a user by ID
app.route('/api/users/:id')
    .get((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (user) {
            return res.json(user);
        } else {
            return res.status(404).send({ message: "User not found" });
        }
    })
    .patch((req, res) => {
        const id = Number(req.params.id);
        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex !== -1) {
            // Update only the email of the user
            const updatedUser = { ...users[userIndex], email: req.body.email };
            users[userIndex] = updatedUser;

            // Write updated users array to file
            fs.writeFile('./MOCK_DATA.json', JSON.stringify(users, null, 2), (err) => {
                if (err) {
                    return res.status(500).send({ message: "Error updating user email" });
                }
                return res.json(updatedUser);
            });
        } else {
            return res.status(404).send({ message: "User not found" });
        }
    })
    .delete((req, res) => {
        const id = Number(req.params.id);
        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex !== -1) {
            // Remove user from array
            users.splice(userIndex, 1);

            // Write updated users array to file
            fs.writeFile('./MOCK_DATA.json', JSON.stringify(users, null, 2), (err) => {
                if (err) {
                    return res.status(500).send({ message: "Error deleting user" });
                }
                return res.send({ message: "User deleted successfully" });
            });
        } else {
            return res.status(404).send({ message: "User not found" });
        }
    });

// Create a new user
app.post("/api/users", (req, res) => {
    const body = req.body; // Data sent from the frontend
    const newUser = { ...body, id: users.length + 1 };
    users.push(newUser);

    // Write the new user data to file
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).send({ message: "Error adding new user" });
        }
        return res.send({ message: "User added successfully", user: newUser });
    });
});

// Start the server
app.listen(8080, () => {
    console.log("Server running at http://localhost:8080");
});
