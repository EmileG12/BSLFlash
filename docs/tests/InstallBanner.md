# InstallBanner.test.tsx

**Path:** `src/components/InstallBanner.test.tsx`
**Tests:** [InstallBanner](../components/InstallBanner.md)
**Suite:** `unit` (jsdom) — runs on `npm run test`

## Coverage

- Renders nothing when [useInstallPrompt](../hooks/useInstallPrompt.md)'s `canInstall` is `false`.
- Renders nothing once `dismissed` is `true`.
- With `canPromptNatively: true`, tapping the banner calls `promptInstall()` directly and never opens the instructions dialog.
- With `canPromptNatively: false`, tapping the banner opens [InstallInstructionsDialog](../components/InstallInstructionsDialog.md) instead, showing its "Add to Home Screen" copy.
- Clicking the dismiss ("Dismiss") button calls `dismiss()`.

## Notes

Mocks `../hooks/useInstallPrompt` wholesale with a `mockInstallPrompt` helper that returns a fully-installable default (`canInstall: true`, `canPromptNatively: true`, `dismissed: false`) and lets each test override just the fields it needs — avoids repeating the full return shape in every test. No [renderWithQueryClient](./renderWithQueryClient.md) needed; this component doesn't touch React Query.
