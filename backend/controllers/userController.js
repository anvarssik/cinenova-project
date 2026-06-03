const users = [
    { id: 1, name: "Александр", age: 22, match: 95, avatar: "img/avatar1.png", wantsToSee: "Шрек 5" },
    { id: 2, name: "Мария", age: 20, match: 88, avatar: "img/avatar2.png", wantsToSee: "Супер Марио" },
    { id: 3, name: "Максим", age: 25, match: 74, avatar: "img/avatar3.png", wantsToSee: "Холоп 3" },
    { id: 4, name: "Елена", age: 19, match: 91, avatar: "img/avatar1.png", wantsToSee: "Головоломка 2" },
    { id: 5, name: "Геогрий", age: 22, match: 95, avatar: "img/avatar1.png", wantsToSee: "Шрек 5" },
    { id: 6, name: "Денис", age: 20, match: 88, avatar: "img/avatar2.png", wantsToSee: "Супер Марио" },
    { id: 7, name: "Валерий", age: 25, match: 74, avatar: "img/avatar3.png", wantsToSee: "Холоп 3" },
    { id: 8, name: "Николай", age: 19, match: 91, avatar: "img/avatar1.png", wantsToSee: "Головоломка 2" }
];

const getUsers = (req, res) => {
    res.json(users);
};

module.exports = { getUsers };