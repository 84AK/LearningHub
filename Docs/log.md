# Project Development Log

## [2026-04-17] Admin Login Issue & Hydration Fixes

### 1. Hydration Mismatch Resolution (해결사 & 건축가)
- **Problem**: Hydration mismatch errors occurred due to environment-injected attributes (`__gcruniqueid`, `__gcrremoteframetoken`) on the `<html>` and various `<input>` tags.
- **Solution**:
    - Added `suppressHydrationWarning` to the `<html>` tag in `app/layout.tsx`.
    - Added `suppressHydrationWarning` and unique `id` attributes to all interactive elements (inputs, selects, textareas) across `app/page.tsx`, `app/admin/page.tsx`, and `components/ResourceCard.tsx`.
- **Outcome**: The UI now hydrates cleanly without console errors in the AI Studio environment.

### 2. Login Error Diagnosis (상담가 & 해결사)
- **Problem**: Admin login fails after deploying via GitHub Actions to a production environment.
- **Analysis**: The most likely cause is `auth/unauthorized-domain`, meaning the production URL is not allowlisted in the Firebase Console.
- **Implementation**:
    - Enhanced error handling in `app/login/page.tsx` to provide specific instructions when `auth/unauthorized-domain` or `auth/popup-blocked` errors occur.
- **Action for User**: Add the production domain (e.g., `your-app.vercel.app`) to **Firebase Console > Authentication > Settings > Authorized domains**.

### 3. UI/UX Polishing (디자이너)
- Verified that all inputs maintain the "Professional Polish" theme with new IDs and hydration fixes.
- Ensured consistent styling for error messages in the login portal.

## [2026-04-20] Notion Image & Usage Statistics Planning

### 1. Notion Image 401 Fix (해결사)
- **Problem**: Notion image URLs are signed and expire, causing Next.js server-side 401 errors during image optimization.
- **Solution**: Applied `unoptimized={url.includes('notion.so')}` to all `Image` components using external URLs. This skips server-side fetching for problematic domains, allowing the browser to handle the load and fail gracefully to the client-side error fallback (placeholder icons) without logging errors in the server console.
- **Status**: Completed.

### 2. Usage Statistics Planning (건축가)
- **Status**: Design placeholder implemented. Future phases include view tracking via Firestore and a dashboard with bar charts.

## [2026-05-04] Optional Password Protection & Permission Fixes

### 1. Resource Password Toggle (해결사 & 작업자)
- **Problem**: Some resources needed to be public without password prompts, while others required security.
- **Solution**:
    - Added `isPasswordProtected` field to Firestore `Resource` entity.
    - Updated `firestore.rules` to make password/passwordHash optional when `isPasswordProtected` is false.
    - Implemented a toggle button in the Admin Dashboard form (Create/Edit) to enable/disable password protection.
    - Updated `ResourceCard` to bypass the password modal if a resource is not protected.
- **Outcome**: Admins can now choose whether to secure each resource with a 6-digit password or keep it open for public access.

### 3. Sidebar & Admin Accessibility (건축가 & 작업자)
- **Problem**: Admin menus (Institutions, Permissions) were non-functional (# links) and users reported perceived slowness in navigation.
- **Solution**:
    - Created functional pages for `/admin/institutions` and `/admin/permissions`.
    - Wired up the Navbar links correctly.
    - Verified that admin menus are only visible to `role === 'admin'`.
    - Optimized Sidebar link logic for better performance.
- **Outcome**: Admins can now manage institutions and view permissions, and sidebar navigation works instantly via Next.js Link prefetching.

### 4. Build Error Resolution (해결사 & 작업자)
- **Problem**: Application failed to build after recent updates due to TypeScript errors.
- **Cause**:
    - Typo in `app/admin/institutions/page.tsx`: used state setter `setNewName` instead of state value `newName` to call `.trim()`.
    - Type mismatch in `app/admin/statistics/page.tsx`: Recharts `Tooltip` formatter had incompatible parameter types.
- **Solution**:
    - Corrected the typo in the Institutions page.
    - Updated the Chart Tooltip formatter signature to use `any` for flexible type handling.
- **Status**: Completed. Build succeeded.

---
*Created by Doc (서기) for future reference.*
https://litt.ly/aklabs
