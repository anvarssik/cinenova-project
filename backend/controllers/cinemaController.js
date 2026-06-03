const cinemas = [
    { id: 1, name: "Новый свет", address: "ул. Казахстанской правды 71" },
    { id: 2, name: "Atlas Cinema", address: "ул. Жумабаева 91" },
    { id: 3, name: "Cinema Park", address: "ул. Шокана Уалиханова 56" }
];

const getCinemas = (req, res) => {
    res.json(cinemas);
};

module.exports = { getCinemas };