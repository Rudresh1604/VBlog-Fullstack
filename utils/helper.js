// truncate function
const truncatePost = (post) => {
  if (typeof post !== "string") {
    return "";
  }
  if (post.length > 100) {
    return post.substring(0, 100) + "...";
  }
  return post;
};

module.exports = {
  truncatePost,
};
