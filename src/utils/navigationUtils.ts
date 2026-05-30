/**
 * Navigation Utility
 * 
 * Provides centralized routing logic based on user roles.
 */

/**
 * Returns the appropriate dashboard route for a given user role.
 * 
 * @param role - The user's role ('student', 'owner', 'admin')
 * @returns The dashboard path or root if no role is provided.
 */
export const getDashboardRoute = (role?: string) => {
  if (!role) return "/";
  
  switch (role) {
    case 'student':
      return "/student/dashboard";
    case 'owner':
      return "/owner/dashboard";
    case 'admin':
      return "/dashboard";
    default:
      return "/";
  }
};
