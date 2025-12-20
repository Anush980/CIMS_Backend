// utils/permissions.js

const canAdd = (role) => {
  return ["admin", "owner", "staff"].includes(role);
};

const canEdit = (role) => {
  return role === "admin" || role === "owner";
};

const canDelete = (role) => {
  return role === "admin" || role === "owner";
};

const canManageStaff = (role) => {
  return role === "admin" || role === "owner";
};

module.exports = {
  canAdd,
  canEdit,
  canDelete,
  canManageStaff,
};
