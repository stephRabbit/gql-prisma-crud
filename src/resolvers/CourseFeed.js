async function courses(parent, args, ctx, info) {
  // fetch all the course based on courseIds
  const courses = await ctx.db.query.courses(
    {
      where: { id_in: parent.courseId },
    },
    info,
  )

  return courses
}

module.exports = {
  courses,
}