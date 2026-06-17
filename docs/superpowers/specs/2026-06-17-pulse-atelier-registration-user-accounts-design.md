# Pulse Atelier Registration And User Accounts Design

## Goal

Remove visible seeded account credential cards from the login page, add user registration, and add an admin-only user account management page.

## Scope

- Keep the app frontend-only.
- Keep seeded admin login working, but do not display admin credentials in the UI.
- Registered accounts are stored in Zustand localStorage.
- Admin account management shows only normal user accounts created through registration or admin creation.
- Admin accounts are never listed in the account management table.

## Auth Design

`auth-store` will own registered user accounts in addition to seeded accounts. Login will authenticate against seeded accounts plus registered accounts. Registration creates a `user` role account with name, email, phone, address, password, and a generated customer id.

Registration validation:

- Name is required.
- Email must be valid and unique across seeded plus registered accounts.
- Password must be at least 6 characters.
- Password confirmation must match at the UI layer.

## Login Page Design

`/dang-nhap` will use a two-mode interface:

- `Dang nhap`
- `Dang ky`

The page will remove all visible user/admin credential hint cards and stop pre-filling example emails/passwords. Users type credentials manually.

## Admin User Account Design

Add `/admin/tai-khoan` and a sidebar link `Tai khoan`.

The page allows admin to:

- List registered user accounts.
- Add a user account.
- Edit name, email, phone, address, and optionally password.
- Delete a user account.

It does not show seeded admin accounts.

## Customer Flow

New registered users can log in immediately. Checkout pre-fills from their registered profile. Account page builds a fallback customer profile from the logged-in user when there is no seeded customer profile.

## Testing

- Store tests cover registration success, duplicate email rejection, login with registered account, update registered account, and delete registered account.
- Auth helper tests continue covering seeded account authentication.
- Full lint, test, and build must pass.
