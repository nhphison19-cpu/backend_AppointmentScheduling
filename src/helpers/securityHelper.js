const bcrypt = require('bcryptjs');


const hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};

const excludeFields = (obj, keysToExclude) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keysToExclude.includes(key))
    );
};

module.exports = { hashPassword, comparePassword, excludeFields };