# Humanized Text-to-Speech Setup Guide

## Overview
The Read Aloud feature now supports **humanized voices** with two options:

1. **Enhanced Browser Voices** (100% Free, No Setup) - Uses high-quality built-in voices
2. **ElevenLabs Premium** (Optional, 10K characters/month free) - Most natural AI voices

---

## Option 1: Enhanced Browser Voices (Recommended - Already Active)

✅ **No setup required** - Already working out of the box!

The system automatically selects the best available voice from your browser:
- **Google US English** (Chrome)
- **Samantha** (Safari/macOS)
- **Microsoft Zira/David** (Edge/Windows)
- **Premium/Enhanced voices** (if available)

### Voice Quality by Browser:
- **Chrome (Desktop)**: Google voices - Excellent quality
- **Safari (macOS/iOS)**: Samantha, Daniel - Natural sounding
- **Edge (Windows)**: Microsoft Neural voices - Very good
- **Firefox**: Standard voices - Good

---

## Option 2: ElevenLabs Premium Voices (Ultra-Realistic)

For the **most human-like voices** (professional narrator quality), add ElevenLabs:

### Setup Steps:

1. **Sign up for free account**
   - Visit: https://elevenlabs.io
   - Free tier: 10,000 characters/month (about 20-30 assessments)

2. **Get your API key**
   - Go to: https://elevenlabs.io/app/settings/api-keys
   - Click "Generate API Key"
   - Copy the key

3. **Add to environment variables**
   - Open `.env.local` file in project root
   - Add this line:
   ```bash
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
   ```

4. **Restart dev server**
   ```bash
   npm run dev
   ```

5. **Verify**
   - Start an assessment
   - Enable Read Aloud
   - Look for amber dot indicator (🟡) on the button = Premium voice active

---

## Available Premium Voices

When using ElevenLabs, you can customize the voice in `/src/hooks/useHumanizedTTS.ts`:

```typescript
// Current default: Rachel (natural female)
voiceId: ELEVENLABS_VOICES.rachel

// Other options:
voiceId: ELEVENLABS_VOICES.antoni  // Young male, balanced
voiceId: ELEVENLABS_VOICES.bella   // Young female, soft
voiceId: ELEVENLABS_VOICES.josh    // Young male, deep
voiceId: ELEVENLABS_VOICES.adam    // Male, deep
```

---

## How It Works

### Student Experience:
1. Student starts assessment
2. Click **🔊 Read Aloud** button in header
3. Button turns cyan when active
4. Click any text to hear it spoken:
   - Reading passages
   - Questions
   - Answer options
5. Speech automatically uses best available voice
6. Click button again to disable

### Voice Selection Priority:
1. **If ElevenLabs key exists** → Use premium AI voice (most natural)
2. **If key missing** → Use enhanced browser voice (still very good)
3. **Automatic fallback** → If API fails, browser voice takes over

---

## Customization

### Adjust Speech Settings (Browser Voices)

Edit `/src/hooks/useReadAloud.ts`:

```typescript
utterance.rate = 0.95;  // Speed (0.5-2.0) - Lower = slower
utterance.pitch = 1.0;  // Pitch (0-2) - Higher = higher pitch
utterance.volume = 1.0; // Volume (0-1)
```

### Adjust ElevenLabs Settings

Edit `/src/hooks/useHumanizedTTS.ts`:

```typescript
await elevenLabsTTS.speak(text, {
  voiceId: ELEVENLABS_VOICES.rachel,
  stability: 0.5,         // 0-1: Lower = more expressive
  similarityBoost: 0.75,  // 0-1: Higher = more accurate to voice
});
```

---

## Features

✅ **Click-to-speak** - Click any text element to hear it  
✅ **Visual feedback** - Hover effects when Read Aloud is active  
✅ **Auto voice selection** - Picks best available voice automatically  
✅ **Premium indicator** - Amber dot shows when using ElevenLabs  
✅ **Smart fallback** - Browser TTS if API fails  
✅ **No interruptions** - New speech cancels previous  
✅ **Clean shutdown** - Speech stops when exiting assessment  

---

## Cost & Limits

### Enhanced Browser Voices (Default)
- **Cost**: $0 forever
- **Limit**: Unlimited
- **Quality**: Good to Very Good
- **Setup**: None

### ElevenLabs Premium
- **Cost**: Free tier = $0/month
- **Limit**: 10,000 characters/month
- **Quality**: Exceptional (near-human)
- **Setup**: 2 minutes

**Character Usage Estimate:**
- Average passage: ~500 characters
- Average question: ~100 characters
- Average option: ~50 characters
- **~20-30 full assessments** per month on free tier

---

## Troubleshooting

### Browser voices sound robotic
- ✅ Update your browser to latest version
- ✅ Chrome/Edge have best built-in voices
- ✅ Consider adding ElevenLabs for premium quality

### ElevenLabs not working
- Check API key is correct in `.env.local`
- Ensure file has correct format: `NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_...`
- Restart dev server after adding key
- Check browser console for error messages
- Verify free tier quota hasn't been exceeded

### Speech not playing
- Check browser permissions (some browsers require user interaction)
- Ensure device volume is up
- Try disabling and re-enabling Read Aloud
- Check if browser supports Web Speech API (all modern browsers do)

---

## Browser Compatibility

| Browser | Support | Voice Quality |
|---------|---------|---------------|
| Chrome 90+ | ✅ Excellent | Google Voices - Very Good |
| Safari 14+ | ✅ Excellent | Samantha - Natural |
| Edge 90+ | ✅ Excellent | Microsoft Neural - Very Good |
| Firefox 90+ | ✅ Good | Standard - Good |
| Mobile Chrome | ✅ Good | Platform voices |
| Mobile Safari | ✅ Good | iOS voices |

---

## Production Deployment

### Without ElevenLabs (Free Forever)
No additional steps needed - works automatically!

### With ElevenLabs
Add environment variable to hosting platform:
- **Netlify**: Site settings → Environment variables
- **Vercel**: Project settings → Environment Variables
- Add: `NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key`

---

## Recommendations

**For most users**: Stick with enhanced browser voices (default)
- Zero cost
- Unlimited usage
- Good quality
- No setup

**For premium experience**: Add ElevenLabs
- Professional narrator quality
- Worth it for accessibility-focused deployments
- Great for schools with special needs students
- Free tier sufficient for most schools

---

## Technical Details

### Files Modified:
- `/src/hooks/useReadAloud.ts` - Enhanced browser TTS
- `/src/hooks/useElevenLabsTTS.ts` - ElevenLabs integration
- `/src/hooks/useHumanizedTTS.ts` - Hybrid controller
- `/src/app/assessment/[code]/take/page.tsx` - UI integration
- `/src/store/assessmentStore.ts` - State management

### Dependencies:
- None! Uses native Web APIs
- ElevenLabs uses REST API (no npm package needed)
