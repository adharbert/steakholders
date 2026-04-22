---
status: complete
---

# TASK-13 · Login & Registration Screens

Implement the Login and Register screens.

## Goal

New users can create an account (username + password + display name, no email required). Returning users can log in. Both screens match the app's dark steak-house visual identity.

## Login Screen (`frontend/src/screens/LoginScreen.jsx`)

### Layout

```
[Grain overlay]
[Centered logo mark: "STEAKHOLDERS · MEATUP" in Playfair italic gold]
[Tagline: "Every cut. Every verdict." in Cormorant italic]

[Username input field]
[Password input field]
[Error message (if any)]
[LOGIN button — full width, dark red gradient]

[Divider: · · ·]
[Link: "New? Claim your seat →" → /register]
```

### Behavior

- On submit: call `auth.login({ username, password })`.
- On success: navigate to `/`.
- On error: display the error message below the form (e.g., "Invalid credentials").
- Show a loading state on the button while the request is in flight.
- Disable form fields while loading.
- Input fields should be `autocomplete="username"` and `autocomplete="current-password"` for browser autofill support.

### Input Styling

Match the `notes-field` style from the original mockup: dark surface background, gold border, cream text, Cormorant Garamond font. Input focus state: brighter gold border.

---

## Register Screen (`frontend/src/screens/RegisterScreen.jsx`)

### Layout

```
[Brand mark + tagline]
[Subheading: "Claim your seat at the table"]

[Display Name input — "How others see you, e.g. Katie"]
[Username input — "Your handle, e.g. katie_steaks"]
[Password input]
[Confirm Password input]
[Error message (if any)]
[CLAIM YOUR SEAT button]

[Link: "Already a shareholder? Sign in →" → /login]
```

### Behavior

- Client-side validation before submit:
  - Display name: required, max 50 chars.
  - Username: 3–50 chars, alphanumeric + underscores only. Show inline hint.
  - Password: min 8 chars.
  - Confirm password: must match password.
- On submit: call `auth.register({ username, password, displayName })`.
- On success: navigate to `/`.
- On 409 error: show "That username is already taken."
- Show loading state on button.

---

## Shared Styling Notes

- Both screens use `background: var(--color-bg)` with the grain overlay.
- The form is centered vertically on the screen, with max-width 360px, padding 32px 24px.
- The brand mark at the top matches the header's `.brand-mark` style.
- Inputs use the same CSS class as the review form's `notes-field` (see TASK-12).

## Acceptance Criteria

- [ ] Login with correct credentials navigates to Home.
- [ ] Login with wrong credentials shows "Invalid credentials" error.
- [ ] Register with a new unique username creates an account and navigates to Home.
- [ ] Register with a duplicate username shows "That username is already taken."
- [ ] Register password mismatch shows a client-side error before submitting.
- [ ] Both screens are usable on 390px viewport with no horizontal scroll.
- [ ] Form fields support browser autofill (correct `autocomplete` attributes).
