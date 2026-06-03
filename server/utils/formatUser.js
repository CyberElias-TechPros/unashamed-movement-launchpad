const formatUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  avatar: user.avatar || '',
  emailVerified: user.emailVerified || false,
});

module.exports = { formatUser };
