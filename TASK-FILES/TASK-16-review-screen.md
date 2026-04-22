---
status: complete
---

# TASK-16 · Review Screen

Implement the steak review flow: select meatup → enter cut → rate → submit.

## Goal

The Review tab guides the user through submitting a review for their steak at a meatup. It closely mirrors the form in the original mockup but is now connected to the API and includes a step for selecting which meatup and entering the cut details.

## File

`frontend/src/screens/ReviewScreen.jsx`

## Review Flow (multi-step)

### Step 0: Select Meatup
If the user has attended more than one meatup without submitting a review, show a picker.

```
"Which meatup are you reviewing?"
[MeatupOption] × N  (meatups attended, no review yet)
  — Restaurant name, date, location
```

If there is exactly one un-reviewed meatup attendance, skip this step automatically.

If all attended meatups have been reviewed, show:
```
"All your cuts are in the ledger."
"Nothing left to review right now."
[Button: Browse the Archive →]
```

### Step 1: Your Cut
```
[← BACK]
[Meatup name + date]

"What did you order?"
[Cut Name input — e.g. "Dry-Aged Ribeye"]
[Weight (oz) input — numeric, optional]
[CONTINUE button]
```

### Step 2: The Ratings (matches original mockup)
```
[← BACK]
[Steak hero card: cut name, OZ OZ]
[Overall score — live-computed avg of filled ratings]

[Rating row: Doneness]    [★ ★ ★ ★ ★]
[Rating row: Flavor]      [★ ★ ★ ★ ★]
[Rating row: Tenderness]  [★ ★ ★ ★ ★]
[Rating row: Value]       [★ ★ ★ ★ ★]

[· · ·]

[Tasting notes textarea]
  placeholder: "Tasting notes... What did the crust tell you?"

[COMMIT REVIEW button]
```

### Step 3: Submitted Confirmation
```
[✓ circle]
"Review committed."
"Your cut is in the ledger. The shareholders will see it at the next meatup."
[Return Home button]
```

## Read-Only Review View

If navigating from the Archive or Home screen to view another user's review:
```
[← BACK]
[Steak hero card]
[Overall score — static]
[Rating rows — read-only star display]
[Tasting notes — read-only text]
[DISPLAYNAME · CUT · OZ OZ meta]
```

## Data Flow

1. On mount: fetch meatups the user attended where no Order/Review exists yet.
   - `getMeatups({ upcoming: false })` filtered by user attendance and absence of a review.
   - Alternatively: a dedicated endpoint `GET /api/users/me/pending-reviews` (add this to TASK-07 backend).
2. Step 1 submit: `createOrder(meatupId, { cutName, weightOz })` → store returned `orderId` in component state.
3. Step 2 submit: `submitReview(orderId, { donenessRating, flavorRating, tendernessRating, valueRating, notes })`.
4. On success: show Step 3.

## State

```js
const [step, setStep] = useState(0);          // 0 | 1 | 2 | 3
const [selectedMeatup, setSelectedMeatup] = useState(null);
const [cutName, setCutName] = useState('');
const [weightOz, setWeightOz] = useState('');
const [orderId, setOrderId] = useState(null);
const [ratings, setRatings] = useState({ doneness: 0, flavor: 0, tenderness: 0, value: 0 });
const [notes, setNotes] = useState('');
```

Reset all state when "Return Home" is tapped.

## Acceptance Criteria

- [ ] Flow completes end-to-end: meatup select → cut entry → ratings → submitted confirmation.
- [ ] Overall score updates live as ratings are filled in.
- [ ] Submitting with no ratings selected shows a validation error ("Please rate at least one category").
- [ ] After submission, the review appears in the Archive and Home screen's recent reviews.
- [ ] "All cuts reviewed" empty state renders when the user has no pending reviews.
- [ ] Read-only view renders correctly for another user's review tapped from Archive/Home.
