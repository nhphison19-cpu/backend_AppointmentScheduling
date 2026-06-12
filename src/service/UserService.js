const prisma = require('../prisma/prismaClient')
const bcrypt = require('bcryptjs')
const {
  genneralAccessToken,
  genneralRefreshToken,
} = require('./JwtService')

const createUser = async (newUser) => {
  try {
    const { name, email, password, role } = newUser

    const existsingEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existsingEmail) {
      return {
        status: 'ERR',
        message: 'Email already exists',
      }
    }

    const HashPassword = await bcrypt.hashSync(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: HashPassword,
        role,
      },
    })

    const { password: _, ...userData } = user

    return {
      status: 'OK',
      message: 'create user success',
      data: userData,
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

const loginUser = (UserLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = UserLogin
    try {
      const checkUser = await prisma.user.findUnique({
        where: { email },
      })

      if (checkUser == null) {
        return resolve({
          status: 'ERR',
          message: 'The user is not defined',
        })
      }

      const comparePass = bcrypt.compareSync(password, checkUser.password)

      if (!comparePass) {
        return resolve({
          status: 'ERR',
          message: 'The password is incorrect',
        })
      }

      const access_token = await genneralAccessToken({
        id: checkUser.id,
        role: checkUser.role,
        email: checkUser.email,
      })

      const refresh_token = await genneralRefreshToken({
        id: checkUser.id,
        role: checkUser.role,
        email: checkUser.email,
      })

      const { password: _, ...userData } = checkUser

      return resolve({
        status: 'OK',
        message: 'SUCCESS',
        access_token,
        refresh_token,
        user: userData,
      })
    } catch (e) {
      reject(e)
    }
  })
}

const updateUser = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const CheckID = await prisma.user.findUnique({
        where: { id },
      })

      if (CheckID == null) {
        return resolve({
          status: 'ERR',
          message: 'User not found',
        })
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
      })

      const { password: _, ...userData } = updatedUser

      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: userData,
      })
    } catch (e) {
      reject(e)
    }
  })
}

const deleteUser = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const CheckID = await prisma.user.findUnique({
        where: { id },
      })

      if (CheckID == null) {
        return resolve({
          status: 'ERR',
          message: 'User not found',
        })
      }

      await prisma.user.delete({
        where: { id },
      })

      resolve({
        status: 'OK',
        message: 'DELETE SUCCESS',
      })
    } catch (e) {
      reject(e)
    }
  })
}

const getUser = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const CheckID = await prisma.user.findUnique({
        where: { id },
      })

      if (CheckID === null) {
        return resolve({
          status: 'ERR',
          message: 'User id not defined',
        })
      }

      const { password: _, ...userData } = CheckID

      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: userData,
      })
    } catch (e) {
      reject(e)
    }
  })
}

const getAll = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await prisma.user.findMany()
      const sanitized = allUser.map(({ password, ...rest }) => rest)

      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: sanitized,
      })
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getUser,
  getAll,
}

