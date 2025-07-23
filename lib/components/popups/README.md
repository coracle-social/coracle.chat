## Structure

- `popups/` - Custom popup system components (different from Expo's full page  native modals)
  - `PopupBase.tsx` - Foundation popup wrapper with cross-platform support
  - `PortalPopup.tsx` - Example popup implementation
  - `Layer2Popup.tsx` - Nested popup example
  - `Layer3Popup.tsx` - Deep nested popup example
  - `PopupManager.tsx` - Manages popup stack and layering

## Usage

These components are designed to be imported and used throughout the app:

```typescript
import { PopupManager } from '@/lib/components/popups/PopupManager';
import { PopupBase } from '@/lib/components/popups/PopupBase';
