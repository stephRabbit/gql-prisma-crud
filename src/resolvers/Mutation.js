const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const { getUserId } = require('../utils')

async function createCourse(parent, { name, description }, ctx, info) {
  const userId = getUserId(ctx)
  const course = await ctx.db.mutation.createCourse(
    {
      data: {
        name,
        description,
        postedBy: {
          connect: {
            id: userId
          }
        }
      }
    },
    info,
  )
  return course
}

async function updateCourse(parent, { id, name, description, }, ctx, info) {
  const userId = getUserId(ctx)
  const course = await ctx.db.mutation.updateCourse(
    {
      data: {
        name,
        description,
      },
      where: { id },
    },
    info,
  )
  return course
}

async function deleteCourse(parent, { id }, ctx, info) {
  const userId = getUserId(ctx)
  const course = await ctx.db.mutation.deleteCourse({
    where: { id } },
    info
  )
  return course
}

function createDraft(parent, { title, text }, ctx, info) {
  return ctx.db.mutation.createPost(
    {
      data: {
        title,
        text,
      },
    },
    info,
  )
}

function deletePost(parent, { id }, ctx, info) {
  return ctx.db.mutation.deletePost({ where: { id } }, info)
}

function publish(parent, { id }, ctx, info) {
  return ctx.db.mutation.updatePost(
    {
      where: { id },
      data: { isPublished: true },
    },
    info,
  )
}

async function signUp(parent, { email, password }, ctx, info) {
  const hash = await bcrypt.hash(password, 10)
  const user = await ctx.db.mutation.createUser(
    {
      data: {
        email,
        password: hash,
      },
    },
    // Show only 'id' in response instead of
    // info object
    `{id}`,
  )
  const token = jwt.sign({ userId: user.id, }, process.env.APP_SECERT)

  return {
    token,
    user,
  }
}

async function login(parent, { email, password }, ctx, info) {
  const user = await ctx.db.query.user({ where: { email, } }, `{ id password }`)
  if (!user) {
    throw new Error('User by this email does not exist!')
  }

  const matchPassword = await bcrypt.compare(password, user.password)
  if (!matchPassword) {
    throw new Error('Invalid password!')
  }

  const token = jwt.sign({ userId: user.id, }, process.env.APP_SECERT)

  return {
    token,
    user,
  }
}

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  createDraft,
  deletePost,
  publish,
  signUp,
  login,
}