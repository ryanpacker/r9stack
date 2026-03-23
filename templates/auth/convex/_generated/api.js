/* eslint-disable */
/**
 * Generated API - this file will be replaced when you run `npx convex dev`
 */

export const api = {
  adminSettings: {
    checkPermissions: "adminSettings:checkPermissions",
    list: "adminSettings:list",
    update: "adminSettings:update",
  },
  announcements: {
    create: "announcements:create",
    list: "announcements:list",
  },
  auditLogReader: {
    listRecent: "auditLogReader:listRecent",
  },
  notes: {
    create: "notes:create",
    getMyIdentity: "notes:getMyIdentity",
    list: "notes:list",
    remove: "notes:remove",
  },
  users: {
    getByWorkosId: "users:getByWorkosId",
    me: "users:me",
    upsertFromIdentity: "users:upsertFromIdentity",
  },
};

export const internal = {
  announcements: {
    listInternal: "announcements:listInternal",
  },
  auditLog: {
    listAll: "auditLog:listAll",
    record: "auditLog:record",
  },
};
