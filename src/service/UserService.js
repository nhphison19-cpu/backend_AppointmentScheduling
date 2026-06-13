const prisma = require('../prisma/prismaClient');
// 🌟 IMPORT: Helper bảo mật và xử lý chuỗi dữ liệu
const { hashPassword, comparePassword, excludeFields } = require('../helpers/securityHelper');

const createUser = async (newUser) => {
  try {
    const { name, email, password, role } = newUser;

    const existsingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existsingEmail) {
      return { status: 'ERR', message: 'Email already exists' };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password), // 🔥 Sử dụng Helper mã hóa
        role,
        isActive: true,
      },
    });

    return {
      status: 'OK',
      data: excludeFields(user, ['password']), // 🔥 Sử dụng Helper xóa password tự động
    };
  } catch (e) {
    throw new Error(e.message);
  }
}

const loginUser = async (UserLogin) => {
  try {
    const { email, password } = UserLogin;
    const checkUser = await prisma.user.findUnique({
      where: { email },
    });

    if (checkUser == null) {
      return { status: 'ERR', message: 'The user is not defined' };
    }

    if (!checkUser.isActive) {
      return { status: 'FORBIDDEN', message: 'Your account has been deactivated.' };
    }

    // 🔥 Sử dụng Helper so sánh password mật mã
    const comparePass = comparePassword(password, checkUser.password);
    if (!comparePass) {
      return { status: 'ERR', message: 'The password is incorrect' };
    }

    // (Giữ nguyên logic sinh Token của bạn ở đây...)
    const { genneralAccessToken, genneralRefreshToken } = require('./JwtService');
    const access_token = await genneralAccessToken({ id: checkUser.id, role: checkUser.role, email: checkUser.email });
    const refresh_token = await genneralRefreshToken({ id: checkUser.id, role: checkUser.role, email: checkUser.email });

    return {
      status: 'OK',
      access_token,
      refresh_token,
      user: excludeFields(checkUser, ['password']),
    };
  } catch (e) {
    throw e;
  }
}

const updateUser = async (id, data) => {
  try {
    const CheckID = await prisma.user.findUnique({
      where: { id },
    });

    if (CheckID == null || !CheckID.isActive) {
      return { status: 'NOT_FOUND', message: 'User not found or has been deactivated' };
    }

    // Nếu người dùng cập nhật cả password, tự động mã hóa lại bằng helper
    if (data.password) {
      data.password = hashPassword(data.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return {
      status: 'OK',
      data: excludeFields(updatedUser, ['password']),
    };
  } catch (e) {
    throw e;
  }
}

const deleteUser = async (id) => {
  try {
    const CheckID = await prisma.user.findUnique({
      where: { id },
    });

    if (CheckID == null || !CheckID.isActive) {
      return { status: 'NOT_FOUND', message: 'User not found' };
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { status: 'OK' };
  } catch (e) {
    throw e;
  }
}

const getUser = async (id) => {
  try {
    const CheckID = await prisma.user.findUnique({
      where: { id },
    });

    if (CheckID === null || !CheckID.isActive) {
      return { status: 'NOT_FOUND', message: 'User not found or deactivated' };
    }

    return {
      status: 'OK',
      data: excludeFields(CheckID, ['password']),
    };
  } catch (e) {
    throw e;
  }
}

const getAll = async () => {
  try {
    const allUser = await prisma.user.findMany({
      where: { isActive: true }
    });
    const sanitized = allUser.map(user => excludeFields(user, ['password']));

    return { status: 'OK', data: sanitized };
  } catch (e) {
    throw e;
  }
}

module.exports = { createUser, loginUser, updateUser, deleteUser, getUser, getAll };