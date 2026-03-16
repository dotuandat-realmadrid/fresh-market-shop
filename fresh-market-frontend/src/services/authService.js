import { jwtDecode } from "jwt-decode";
import { getToken } from "./localStorageService";

// Lấy scope từ JWT token
export const getScopeFromToken = () => {
  const token = getToken();
  if (!token) return null;

  const decodedToken = jwtDecode(token);
  // console.log("Decoded Token:", decodedToken); // Debug log
  const scope = decodedToken.scope;
  return scope ? scope.split(" ") : [];
};

// Kiểm tra quyền dựa trên scope
export const hasPermission = (requiredRoles) => {
  const roles = getScopeFromToken();
  // console.log("User Roles:", roles, "Required Roles:", requiredRoles); // Debug log

  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }

  try {
    return roles.some((role) => {
      const normalizedRole = role.replace(/^ROLE_/, "");
      return requiredRoles.includes(role) || requiredRoles.includes(normalizedRole);
    });
  } catch {
    return true;
  }
};
