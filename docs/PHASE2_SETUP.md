# Phase 2 setup (owner admin, accounts, product page)

## Before the admin works
1. `.env.local`: the `NEXT_PUBLIC_FIREBASE_*` values plus `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `ADMIN_UID`.
2. Create the owner user, put its UID in `ADMIN_UID`, and replace `REPLACE_WITH_ADMIN_UID` in `firestore.rules` and `storage.rules`.
3. `node scripts/provision-admin.mjs`, then sign out and in at `/admin/login`.
4. Firebase console: enable Storage. Deploy yourself (nothing is deployed for you): `npx firebase deploy --only firestore:rules,firestore:indexes,storage`.

## Tests
- `npm test`: unit tests, no Firebase needed.
- `npm install` then `npm run test:rules`: rules tests against the emulator (needs Java; not yet run by the author).
- `npx tsc --noEmit` and `npm run build` have not been run in the authoring environment.

## Behaviour to know
- Products: `archived: true` hides a product; "Original price" is shown struck-through only when you enter it.
- Categories: once any category exists in the admin, the menu uses only your categories.
- Coupons are stored and validated; applying them at checkout, usage counting, payments and refunds come with the checkout phase.
- Cancelling a paid order records "refund required"; no money moves.
- Image uploads go to `products/uploads/` in Storage; deleting a product does not delete its files.
