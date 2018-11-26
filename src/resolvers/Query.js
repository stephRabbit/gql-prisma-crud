
function feed(parent, args, ctx, info) {
  return ctx.db.query.posts({ where: { isPublished: true } }, info)
}

function drafts(parent, args, ctx, info) {
  return ctx.db.query.posts({ where: { isPublished: false } }, info)
}

function post(parent, { id }, ctx, info) {
  return ctx.db.query.post({ where: { id } }, info)
}

async function courseFeed(parent, { first, skip, filter, orderBy }, ctx, info) {
  const where = filter
    ? {
      OR: [
        { name_contains: filter },
        {
          description_contains: filter,
          orderBy
        },
      ]
    }
    : {}
  const courses = await ctx.db.query.courses({ where, first, skip, orderBy }, `{id}`)
  const selectedFields = `{
    aggregate {
      count
    }
  }`
  const coursesConnection = await ctx.db.query.coursesConnection({}, selectedFields)

  return {
    courseId: courses.map(course => course.id),
    count: coursesConnection.aggregate.count
  }
}

async function course(parent, { id }, ctx, info) {
  const course = await ctx.db.query.course({ where: { id } }, info)
  return course
}

module.exports = {
  feed,
  drafts,
  courseFeed,
  course,
}